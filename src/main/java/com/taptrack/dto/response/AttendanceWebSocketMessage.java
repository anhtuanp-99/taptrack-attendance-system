package com.taptrack.dto.response;
import com.taptrack.enums.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AttendanceWebSocketMessage(
        String type,
        Long employeeId, String employeeName,
        Long departmentId, String departmentName,
        LocalDate workDate,
        LocalDateTime checkInTime, LocalDateTime checkOutTime,
        CheckInStatus checkInStatus, CheckOutStatus checkOutStatus) {}