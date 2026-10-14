package com.taptrack.dto.request;
import jakarta.validation.constraints.*;
import java.time.LocalTime;

public record ShiftTemplateRequest(
        @NotBlank(message = "Tên mẫu ca không được để trống")
        @Size(max = 100, message = "Tên mẫu ca tối đa 100 ký tự")
        String name,

        @NotNull(message = "Giờ bắt đầu không được để trống")
        LocalTime startTime,

        @NotNull(message = "Giờ kết thúc không được để trống")
        LocalTime endTime) {}