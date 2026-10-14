package com.taptrack.mapper;

import com.taptrack.dto.response.EmployeeResponse;
import com.taptrack.entity.Employee;
import org.springframework.stereotype.Component;

@Component
public class EmployeeMapper {
    public EmployeeResponse toResponse(Employee e) {
        return new EmployeeResponse(
                e.getId(),
                e.getAccount().getId(),
                e.getAccount().getEmail(),
                e.getAccount().getFullName(),
                e.getDepartment().getId(),
                e.getDepartment().getName(),
                e.getEmployeeCode(),
                e.getCardCode(),
                e.getJobTitle(),
                e.getEmploymentStatus());
    }
}