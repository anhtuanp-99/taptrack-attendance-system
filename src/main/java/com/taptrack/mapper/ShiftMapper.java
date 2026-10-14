package com.taptrack.mapper;

import com.taptrack.dto.response.*;
import com.taptrack.entity.*;
import org.springframework.stereotype.Component;

@Component
public class ShiftMapper {

    public ShiftTemplateResponse toTemplate(ShiftTemplate t) {
        return new ShiftTemplateResponse(t.getId(), t.getName(),
                t.getStartTime(), t.getEndTime());
    }

    public ShiftAssignmentResponse toAssignment(ShiftAssignment a) {
        return new ShiftAssignmentResponse(
                a.getId(),
                a.getEmployee().getId(),
                a.getEmployee().getAccount().getFullName(),
                a.getShiftTemplate().getId(),
                a.getShiftTemplate().getName(),
                a.getWorkDate());
    }
}