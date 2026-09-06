// AccountCreateRequest.java (Dùng chung tạo Employee/Admin)
package com.taptrack.dto.request;

import com.taptrack.enums.Role;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccountCreateRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @NotNull(message = "Role không được để trống")
    private Role role;

    @Valid
    private EmployeeProfileRequest employeeProfile; // Bắt buộc nếu role = EMPLOYEE
}