package com.taptrack.dto.request;
import com.taptrack.enums.Role;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

public record AccountCreateRequest(
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        String email,

        @NotBlank(message = "Họ tên không được để trống")
        @Size(max = 120, message = "Họ tên tối đa 120 ký tự")
        String fullName,

        @NotBlank(message = "Mật khẩu ban đầu không được để trống")
        @Size(min = 6, max = 100, message = "Mật khẩu ban đầu phải từ 6 đến 100 ký tự")
        String initialPassword,

        @NotNull(message = "Vai trò không được để trống")
        Role role,

        @Valid
        EmployeeProfileRequest employeeProfile) {}