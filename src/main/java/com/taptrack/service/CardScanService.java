package com.taptrack.service;

import com.taptrack.config.AttendanceProperties;
import com.taptrack.dto.response.CardScanResponse;
import com.taptrack.entity.*;
import com.taptrack.enums.*;
import com.taptrack.exception.ErrorCode;
import com.taptrack.mapper.AttendanceMapper;
import com.taptrack.repository.*;
import com.taptrack.service.event.AttendanceChangedEvent;
import com.taptrack.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class CardScanService {

    private static final DateTimeFormatter HHmm = DateTimeFormatter.ofPattern("HH:mm");

    private final EmployeeRepository employeeRepo;
    private final ShiftAssignmentRepository assignmentRepo;
    private final AttendanceRecordRepository attendanceRepo;
    private final UnknownCardLogService unknownCardLogService;
    private final CardCodeNormalizer normalizer;
    private final TimeProvider time;
    private final AttendanceProperties props;
    private final AttendanceMapper mapper;
    private final ApplicationEventPublisher events;

    /**
     * Luồng ESP32 theo FR-5.8. LUÔN trả về CardScanResponse (không throw),
     * kèm HttpStatus tương ứng với ErrorCode.
     */
    @Transactional
    public CardScanResult scan(String rawCardCode) {
        String cardCode = normalizer.normalize(rawCardCode);
        if (cardCode == null || cardCode.isBlank()) {
            return errorResult(ErrorCode.UNKNOWN_CARD, null);
        }

        Employee emp = employeeRepo.findByCardCode(cardCode).orElse(null);
        if (emp == null) {
            try {
                unknownCardLogService.log(cardCode);
            } catch (Exception ex) {
                log.warn("Không ghi được UNKNOWN_CARD_LOG: {}", ex.getMessage());
            }
            return errorResult(ErrorCode.UNKNOWN_CARD, null);
        }

        if (emp.getEmploymentStatus() == EmploymentStatus.INACTIVE) {
            return errorResult(ErrorCode.EMPLOYEE_INACTIVE, emp);
        }

        LocalDate today = time.today();
        ShiftAssignment assignment = assignmentRepo
                .findByEmployeeIdAndWorkDate(emp.getId(), today)
                .orElse(null);
        if (assignment == null) {
            return errorResult(ErrorCode.NO_SHIFT_TODAY, emp);
        }

        AttendanceRecord existing = attendanceRepo
                .findByEmployeeIdAndWorkDate(emp.getId(), today)
                .orElse(null);

        if (existing == null)                   return doCheckIn(emp, assignment.getShiftTemplate(), today);
        if (existing.getCheckOutTime() == null) return doCheckOut(emp, assignment.getShiftTemplate(), existing);
        return errorResult(ErrorCode.ATTENDANCE_ALREADY_COMPLETE, emp);
    }

    // ---------------- success ----------------

    private CardScanResult doCheckIn(Employee emp, ShiftTemplate tpl, LocalDate today) {
        LocalDateTime now = time.now();
        LocalDateTime shiftStart = LocalDateTime.of(today, tpl.getStartTime());

        CheckInStatus status;
        Integer lateMinutes = null;
        long diff = Duration.between(shiftStart, now).toMinutes();
        if (diff <= props.getGracePeriodMinutes()) {
            status = CheckInStatus.ON_TIME;
        } else {
            status = CheckInStatus.LATE;
            lateMinutes = (int) diff;
        }

        AttendanceRecord rec = AttendanceRecord.builder()
                .employee(emp).workDate(today)
                .checkInTime(now).checkInStatus(status).lateMinutes(lateMinutes)
                .build();

        try {
            rec = attendanceRepo.saveAndFlush(rec);
        } catch (DataIntegrityViolationException ex) {
            return errorResult(ErrorCode.SCAN_CONFLICT, emp);
        }

        events.publishEvent(new AttendanceChangedEvent(
                mapper.toWsMessage(rec, "attendance.created")));

        CardScanResponse body = new CardScanResponse(
                now,
                emp.getId(),
                emp.getAccount().getFullName(),
                AttendanceType.CHECK_IN,
                status,
                null,
                LedCommand.GREEN,
                formatOled(emp.getAccount().getFullName(), now, "IN"));
        return CardScanResult.ok(body);
    }

    private CardScanResult doCheckOut(Employee emp, ShiftTemplate tpl, AttendanceRecord rec) {
        LocalDateTime now = time.now();
        LocalDateTime shiftEnd = LocalDateTime.of(rec.getWorkDate(), tpl.getEndTime());

        CheckOutStatus status;
        Integer earlyMinutes = null;
        if (now.isBefore(shiftEnd)) {
            status = CheckOutStatus.EARLY_LEAVE;
            earlyMinutes = (int) Duration.between(now, shiftEnd).toMinutes();
        } else {
            status = CheckOutStatus.ON_TIME;
        }
        rec.setCheckOutTime(now);
        rec.setCheckOutStatus(status);
        rec.setEarlyLeaveMinutes(earlyMinutes);
        attendanceRepo.save(rec);

        events.publishEvent(new AttendanceChangedEvent(
                mapper.toWsMessage(rec, "attendance.updated")));

        CardScanResponse body = new CardScanResponse(
                now,
                emp.getId(),
                emp.getAccount().getFullName(),
                AttendanceType.CHECK_OUT,
                rec.getCheckInStatus(),
                status,
                LedCommand.GREEN,
                formatOled(emp.getAccount().getFullName(), now, "OUT"));
        return CardScanResult.ok(body);
    }

    // ---------------- error ----------------

    /** Trả về body CardScanResponse thống nhất cho mọi lỗi — ESP32 luôn parse được. */
    private CardScanResult errorResult(ErrorCode code, Employee emp) {
        String oled = code.getOledMessage() == null ? "Loi" : code.getOledMessage();
        if (oled.length() > 20) oled = oled.substring(0, 20);

        Long empId = (emp != null) ? emp.getId() : null;
        String empName = (emp != null) ? emp.getAccount().getFullName() : null;

        CardScanResponse body = new CardScanResponse(
                time.now(),
                empId,
                empName,
                null, null, null,
                LedCommand.RED,
                oled);

        return CardScanResult.of(body, code.getStatus());
    }

    // ---------------- helper ----------------

    /** 2 dòng, mỗi dòng ≤ 20 ký tự. */
    private String formatOled(String fullName, LocalDateTime t, String tag) {
        String name = fullName == null ? "" : fullName;
        if (name.length() > 20) name = name.substring(0, 20);
        String line2 = t.format(HHmm) + " " + tag;
        if (line2.length() > 20) line2 = line2.substring(0, 20);
        return name + "\n" + line2;
    }
}