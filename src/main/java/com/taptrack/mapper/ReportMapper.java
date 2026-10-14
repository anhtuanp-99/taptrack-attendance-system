package com.taptrack.mapper;

import com.taptrack.dto.response.AbsentEmployeeResponse;
import com.taptrack.entity.Employee;
import org.springframework.stereotype.Component;

@Component
public class ReportMapper {
    public AbsentEmployeeResponse toAbsent(Employee e, String shiftName) {
        return new AbsentEmployeeResponse(
                e.getId(),
                e.getAccount().getFullName(),
                e.getDepartment().getId(),
                e.getDepartment().getName(),
                shiftName);
    }
}