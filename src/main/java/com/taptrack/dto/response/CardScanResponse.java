package com.taptrack.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.taptrack.enums.*;
import java.time.LocalDateTime;

public record CardScanResponse(
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime scanTime,
        Long employeeId,
        String employeeName,
        AttendanceType attendanceType,
        CheckInStatus checkInStatus,
        CheckOutStatus checkOutStatus,
        LedCommand ledCommand,
        String oledMessage) {}