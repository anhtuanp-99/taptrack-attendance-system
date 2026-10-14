package com.taptrack.dto.request;
import jakarta.validation.constraints.*;

public record EmployeeProfileRequest(
        @NotBlank(message = "Mã nhân viên không được để trống")
        @Size(max = 50, message = "Mã nhân viên tối đa 50 ký tự")
        String employeeCode,

        @NotBlank(message = "Mã thẻ không được để trống")
        @Size(max = 64, message = "Mã thẻ tối đa 64 ký tự")
        String cardCode,

        @NotNull(message = "Phòng ban không được để trống")
        Long departmentId,

        @Size(max = 100, message = "Chức danh tối đa 100 ký tự")
        String jobTitle) {}