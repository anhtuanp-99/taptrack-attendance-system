package com.taptrack.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class ShiftAssignmentRequest {
    @NotNull(message = "Nhân viên không được để trống")
    private Long employeeId;

    @NotNull(message = "Ngày làm việc không được để trống")
    private LocalDate workDate;

    private Long shiftTemplateId;
    private LocalTime customStartTime;
    private LocalTime customEndTime;
}