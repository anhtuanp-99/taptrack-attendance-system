package com.taptrack.dto.response;

import com.taptrack.enums.EmploymentStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class EmployeeResponse {
    private Long id;
    private Long accountId;
    private String email;
    private String fullName;
    private Long departmentId;
    private String departmentName;
    private String employeeCode;
    private String cardCode;
    private String jobTitle;
    private EmploymentStatus employmentStatus;
    private LocalDateTime createdAt;
}