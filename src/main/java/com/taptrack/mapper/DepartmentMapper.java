package com.taptrack.mapper;

import com.taptrack.dto.response.DepartmentResponse;
import com.taptrack.entity.Department;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper {
    public DepartmentResponse toResponse(Department d) {
        return new DepartmentResponse(d.getId(), d.getName());
    }
}