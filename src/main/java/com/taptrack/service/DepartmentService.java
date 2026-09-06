// DepartmentService.java
package com.taptrack.service;

import com.taptrack.dto.request.DepartmentRequest;
import com.taptrack.dto.response.DepartmentResponse;
import com.taptrack.entity.Department;
import com.taptrack.exception.AppException;
import com.taptrack.exception.ErrorCode;
import com.taptrack.repository.DepartmentRepository;
import com.taptrack.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(d -> DepartmentResponse.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .createdAt(d.getCreatedAt())
                        .updatedAt(d.getUpdatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        Department department = Department.builder()
                .name(request.getName().trim())
                .build();

        Department saved = departmentRepository.save(department);
        return DepartmentResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .build();
    }

    @Transactional
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new AppException(ErrorCode.DEPARTMENT_NOT_FOUND);
        }

        // Chặn xóa phòng ban nếu còn nhân viên
        if (employeeRepository.existsByDepartmentId(id)) {
            throw new AppException(ErrorCode.DEPARTMENT_HAS_EMPLOYEES);
        }

        departmentRepository.deleteById(id);
    }
}