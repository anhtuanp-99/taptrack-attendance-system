package com.taptrack.dto.response;

import com.taptrack.enums.CheckInStatus;
import com.taptrack.enums.CheckOutStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdminAttendanceResponse(
        Long id,
        Long employeeId,
        String employeeCode,
        String employeeName,
        String departmentName,
        LocalDate workDate,
        LocalDateTime checkInTime,
        LocalDateTime checkOutTime,
        CheckInStatus checkInStatus,
        CheckOutStatus checkOutStatus,
        Integer lateMinutes,
        Integer earlyLeaveMinutes,
        boolean isManualEdit,
        LocalDateTime editedAt,
        String editReason
) {}