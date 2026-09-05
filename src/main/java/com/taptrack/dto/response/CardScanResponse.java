package com.taptrack.dto.response;

import com.taptrack.enums.AttendanceType;
import com.taptrack.enums.LedCommand;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class CardScanResponse {
    private String employeeName;
    private String employeeCode;
    private AttendanceType attendanceType; // CHECK_IN hoặc CHECK_OUT
    private String status; // ON_TIME, LATE, EARLY_LEAVE...
    private LocalDateTime scanTime; // Backend time chuẩn cho ESP32 OLED
    private LedCommand ledCommand; // GREEN / RED
    private String displayMessage; // Chữ tiếng Việt không dấu cho OLED
}