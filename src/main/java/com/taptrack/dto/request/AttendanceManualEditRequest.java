package com.taptrack.dto.request;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AttendanceManualEditRequest(
        @NotNull(message = "Nhân viên không được để trống")
        Long employeeId,

        @NotNull(message = "Ngày làm việc không được để trống")
        LocalDate workDate,

        LocalDateTime checkInTime,
        LocalDateTime checkOutTime,

        @Size(max = 500, message = "Lý do tối đa 500 ký tự")
        String reason) {}