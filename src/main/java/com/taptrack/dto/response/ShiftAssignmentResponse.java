package com.taptrack.dto.response;
import java.time.LocalDate;

public record ShiftAssignmentResponse(
        Long id, Long employeeId, String employeeName,
        Long shiftTemplateId, String shiftTemplateName,
        LocalDate workDate) {}