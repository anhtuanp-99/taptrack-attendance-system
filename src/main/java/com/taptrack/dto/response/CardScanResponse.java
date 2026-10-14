package com.taptrack.dto.response;

import com.taptrack.enums.*;
import java.time.LocalDateTime;

public record CardScanResponse(
        LocalDateTime scanTime,
        Long employeeId,        // MỚI
        String employeeName,    // MỚI
        AttendanceType attendanceType,
        CheckInStatus checkInStatus,
        CheckOutStatus checkOutStatus,
        LedCommand ledCommand,
        String oledMessage) {}