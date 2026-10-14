package com.taptrack.service;

import com.taptrack.dto.request.AttendanceManualEditRequest;
import com.taptrack.dto.response.*;
import com.taptrack.entity.*;
import com.taptrack.enums.*;
import com.taptrack.exception.*;
import com.taptrack.mapper.AttendanceMapper;
import com.taptrack.repository.*;
import com.taptrack.util.TimeProvider;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRepo;
    private final EmployeeRepository employeeRepo;
    private final ShiftAssignmentRepository assignmentRepo;
    private final AttendanceMapper mapper;
    private final TimeProvider time;

    @Transactional(readOnly = true)
    public Page<MyAttendanceResponse> myHistory(Long employeeId, LocalDate from, LocalDate to,
                                                int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("workDate").descending());
        return attendanceRepo.findByEmployeeIdAndWorkDateBetween(employeeId, from, to, p)
                .map(mapper::toMyAttendance);
    }

    @Transactional(readOnly = true)
    public Page<MyAttendanceResponse> adminHistory(Long employeeId, Long departmentId,
                                                   LocalDate from, LocalDate to,
                                                   int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("workDate").descending());
        return attendanceRepo.findAll((root, q, cb) -> {
            var ps = new ArrayList<Predicate>();
            if (employeeId != null)    ps.add(cb.equal(root.get("employee").get("id"), employeeId));
            if (departmentId != null)  ps.add(cb.equal(root.get("employee").get("department").get("id"), departmentId));
            ps.add(cb.between(root.get("workDate"), from, to));
            return cb.and(ps.toArray(new Predicate[0]));
        }, p).map(mapper::toMyAttendance);
    }

    @Transactional
    public AttendanceManualEditResponse manualEdit(Long adminId, AttendanceManualEditRequest req) {
        Employee emp = employeeRepo.findById(req.employeeId())
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND));

        ShiftAssignment assignment = assignmentRepo
                .findByEmployeeIdAndWorkDate(emp.getId(), req.workDate())
                .orElseThrow(() -> new AppException(ErrorCode.NO_SHIFT_ASSIGNMENT_FOR_DATE));

        if (req.checkInTime() != null && req.checkOutTime() != null
                && req.checkOutTime().isBefore(req.checkInTime())) {
            throw new AppException(ErrorCode.ATTENDANCE_TIME_INVALID);
        }

        AttendanceRecord rec = attendanceRepo
                .findByEmployeeIdAndWorkDate(emp.getId(), req.workDate())
                .orElseGet(() -> AttendanceRecord.builder()
                        .employee(emp).workDate(req.workDate()).build());

        // Recalc check-in status
        if (req.checkInTime() != null) {
            rec.setCheckInTime(req.checkInTime());
            LocalDateTime shiftStart = LocalDateTime.of(req.workDate(),
                    assignment.getShiftTemplate().getStartTime());
            long late = Duration.between(shiftStart, req.checkInTime()).toMinutes();
            if (late <= 0) { rec.setCheckInStatus(CheckInStatus.ON_TIME); rec.setLateMinutes(null); }
            else           { rec.setCheckInStatus(CheckInStatus.LATE);    rec.setLateMinutes((int) late); }
        } else if (rec.getCheckInTime() == null) {
            throw new AppException(ErrorCode.ATTENDANCE_TIME_INVALID);
        }

        // Recalc check-out status
        if (req.checkOutTime() != null) {
            rec.setCheckOutTime(req.checkOutTime());
            LocalDateTime shiftEnd = LocalDateTime.of(req.workDate(),
                    assignment.getShiftTemplate().getEndTime());
            if (req.checkOutTime().isBefore(shiftEnd)) {
                rec.setCheckOutStatus(CheckOutStatus.EARLY_LEAVE);
                rec.setEarlyLeaveMinutes((int) Duration.between(req.checkOutTime(), shiftEnd).toMinutes());
            } else {
                rec.setCheckOutStatus(CheckOutStatus.ON_TIME);
                rec.setEarlyLeaveMinutes(null);
            }
        }

        rec.setManualEdit(true);
        rec.setEditedByAccountId(adminId);
        rec.setEditedAt(time.now());
        rec.setEditReason(req.reason());
        attendanceRepo.save(rec);

        return new AttendanceManualEditResponse(
                rec.getId(), emp.getId(), rec.getWorkDate(),
                rec.getCheckInTime(), rec.getCheckOutTime(),
                rec.isManualEdit(), rec.getEditReason());
    }
}