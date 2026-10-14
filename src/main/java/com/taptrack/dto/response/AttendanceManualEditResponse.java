package com.taptrack.dto.response;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AttendanceManualEditResponse(
        Long id, Long employeeId, LocalDate workDate,
        LocalDateTime checkInTime, LocalDateTime checkOutTime,
        boolean isManualEdit, String editReason) {}