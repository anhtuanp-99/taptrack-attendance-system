package com.taptrack.dto.response;

public record AbsentEmployeeResponse(
        Long employeeId, String employeeName,
        Long departmentId, String departmentName,
        String shiftName) {}