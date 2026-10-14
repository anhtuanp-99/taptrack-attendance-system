package com.taptrack.dto.request;
import jakarta.validation.constraints.*;

public record ResetPasswordRequest(
        @NotBlank(message = "Mật khẩu mới không được để trống")
        @Size(min = 6, max = 100, message = "Mật khẩu mới phải từ 6 đến 100 ký tự")
        String newPassword) {}