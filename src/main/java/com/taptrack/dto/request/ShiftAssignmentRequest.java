package com.taptrack.dto.request;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record ShiftAssignmentRequest(
        @NotNull(message = "Nhân viên không được để trống")
        Long employeeId,

        @NotNull(message = "Mẫu ca không được để trống")
        Long shiftTemplateId,

        @NotNull(message = "Ngày làm việc không được để trống")
        LocalDate workDate) {}