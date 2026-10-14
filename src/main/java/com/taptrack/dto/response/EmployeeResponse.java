package com.taptrack.dto.response;
import com.taptrack.enums.EmploymentStatus;

public record EmployeeResponse(
        Long id, Long accountId, String email, String fullName,
        Long departmentId, String departmentName,
        String employeeCode, String cardCode, String jobTitle,
        EmploymentStatus employmentStatus) {}