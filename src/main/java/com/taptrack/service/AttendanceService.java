package com.taptrack.service;

import com.taptrack.dto.request.CardScanRequest;
import com.taptrack.dto.response.CardScanResponse;
import com.taptrack.entity.*;
import com.taptrack.enums.*;
import com.taptrack.exception.ErrorCode;
import com.taptrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final EmployeeRepository employeeRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final UnknownCardLogService unknownCardLogService;

    // Grace Period cố định toàn hệ thống (15 phút)
    private static final int SYSTEM_GRACE_PERIOD_MINUTES = 15;

    @Transactional
    public CardScanResponse processCardScan(CardScanRequest request) {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        LocalTime currentTime = now.toLocalTime();

        // 1. Normalize CardCode (trim + uppercase + xóa khoảng trắng)
        String rawCardCode = request.getCardCode();
        String normalizedCardCode = rawCardCode != null ? rawCardCode.trim().replaceAll("\\s+", "").toUpperCase() : "";

        // 2. Tra cứu Nhân viên theo CardCode
        Employee employee = employeeRepository.findByCardCode(normalizedCardCode)
                .orElse(null);

        // Trường hợp 2.1: Thẻ lạ -> Ghi log độc lập và trả lỗi LED đỏ
        if (employee == null) {
            unknownCardLogService.logUnknownCard(normalizedCardCode, now);

            return CardScanResponse.builder()
                    .ledCommand(LedCommand.RED)
                    .scanTime(now)
                    .displayMessage("The la / Unknown")
                    .build();
        }

        // Trường hợp 2.2: Tài khoản INACTIVE -> Từ chối
        if (employee.getEmploymentStatus() == EmploymentStatus.INACTIVE) {
            return CardScanResponse.builder()
                    .employeeName(employee.getAccount().getFullName())
                    .employeeCode(employee.getEmployeeCode())
                    .ledCommand(LedCommand.RED)
                    .scanTime(now)
                    .displayMessage(ErrorCode.EMPLOYEE_INACTIVE.getDefaultMessage())
                    .build();
        }

        // 3. Kiểm tra Phân ca trong ngày
        ShiftAssignment assignment = shiftAssignmentRepository.findByEmployeeIdAndWorkDate(employee.getId(), today)
                .orElse(null);

        if (assignment == null) {
            return CardScanResponse.builder()
                    .employeeName(employee.getAccount().getFullName())
                    .employeeCode(employee.getEmployeeCode())
                    .ledCommand(LedCommand.RED)
                    .scanTime(now)
                    .displayMessage(ErrorCode.NO_SHIFT_ASSIGNED.getDefaultMessage())
                    .build();
        }

        // Xác định giờ bắt đầu / kết thúc ca (Tùy chỉnh hoặc Template)
        LocalTime shiftStartTime = assignment.getCustomStartTime() != null ?
                assignment.getCustomStartTime() : assignment.getShiftTemplate().getStartTime();
        LocalTime shiftEndTime = assignment.getCustomEndTime() != null ?
                assignment.getCustomEndTime() : assignment.getShiftTemplate().getEndTime();

        // 4. Tra cứu hoặc khởi tạo bản ghi Chấm công
        AttendanceRecord record = attendanceRecordRepository.findByEmployeeIdAndWorkDate(employee.getId(), today)
                .orElse(null);

        // LƯỢT 1: CHECK-IN
        if (record == null) {
            CheckInStatus checkInStatus = currentTime.isAfter(shiftStartTime.plusMinutes(SYSTEM_GRACE_PERIOD_MINUTES))
                    ? CheckInStatus.LATE : CheckInStatus.ON_TIME;

            record = AttendanceRecord.builder()
                    .employee(employee)
                    .workDate(today)
                    .checkInTime(now)
                    .checkInStatus(checkInStatus)
                    .isManualEdit(false)
                    .build();

            attendanceRecordRepository.save(record);

            return CardScanResponse.builder()
                    .employeeName(employee.getAccount().getFullName())
                    .employeeCode(employee.getEmployeeCode())
                    .attendanceType(AttendanceType.CHECK_IN)
                    .status(checkInStatus.name())
                    .scanTime(now)
                    .ledCommand(LedCommand.GREEN)
                    .displayMessage("Vao: " + (checkInStatus == CheckInStatus.ON_TIME ? "Dung gio" : "Tre"))
                    .build();
        }

        // LƯỢT 2: CHECK-OUT
        if (record.getCheckOutTime() == null) {
            CheckOutStatus checkOutStatus = currentTime.isBefore(shiftEndTime)
                    ? CheckOutStatus.EARLY_LEAVE : CheckOutStatus.ON_TIME;

            record.setCheckOutTime(now);
            record.setCheckOutStatus(checkOutStatus);

            attendanceRecordRepository.save(record);

            return CardScanResponse.builder()
                    .employeeName(employee.getAccount().getFullName())
                    .employeeCode(employee.getEmployeeCode())
                    .attendanceType(AttendanceType.CHECK_OUT)
                    .status(checkOutStatus.name())
                    .scanTime(now)
                    .ledCommand(LedCommand.GREEN)
                    .displayMessage("Ra: " + (checkOutStatus == CheckOutStatus.ON_TIME ? "Dung gio" : "Ve som"))
                    .build();
        }

        // LƯỢT 3 TRỞ ĐI: Đã đủ lượt Check-in và Check-out -> Từ chối
        return CardScanResponse.builder()
                .employeeName(employee.getAccount().getFullName())
                .employeeCode(employee.getEmployeeCode())
                .ledCommand(LedCommand.RED)
                .scanTime(now)
                .displayMessage(ErrorCode.ATTENDANCE_LIMIT_EXCEEDED.getDefaultMessage())
                .build();
    }
}