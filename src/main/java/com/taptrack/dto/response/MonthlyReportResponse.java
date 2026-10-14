package com.taptrack.dto.response;

public record MonthlyReportResponse(
        Long employeeId, String employeeName, String departmentName,
        int onTimeDays, int lateDays, int earlyLeaveDays,
        int absentDays, int missingCheckOutDays) {}