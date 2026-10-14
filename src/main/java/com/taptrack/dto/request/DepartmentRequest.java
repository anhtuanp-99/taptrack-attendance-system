package com.taptrack.dto.request;
import jakarta.validation.constraints.*;

public record DepartmentRequest(
        @NotBlank(message = "Tên phòng ban không được để trống")
        @Size(max = 100, message = "Tên phòng ban tối đa 100 ký tự")
        String name) {}