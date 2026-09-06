package com.taptrack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeUpdateRequest {
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @NotNull(message = "Phòng ban không được để trống")
    private Long departmentId;

    @NotBlank(message = "Mã thẻ từ không được để trống")
    private String cardCode;

    private String jobTitle;
}