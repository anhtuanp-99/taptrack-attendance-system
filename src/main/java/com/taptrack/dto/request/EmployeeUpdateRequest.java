package com.taptrack.dto.request;
import com.taptrack.enums.EmploymentStatus;
import jakarta.validation.constraints.*;

public record EmployeeUpdateRequest(
        @NotBlank(message = "Họ tên không được để trống")
        @Size(max = 120, message = "Họ tên tối đa 120 ký tự")
        String fullName,

        @NotNull(message = "Phòng ban không được để trống")
        Long departmentId,

        @Size(max = 100, message = "Chức danh tối đa 100 ký tự")
        String jobTitle,

        @NotBlank(message = "Mã thẻ không được để trống")
        @Size(max = 64, message = "Mã thẻ tối đa 64 ký tự")
        String cardCode,

        @NotNull(message = "Trạng thái làm việc không được để trống")
        EmploymentStatus employmentStatus) {}