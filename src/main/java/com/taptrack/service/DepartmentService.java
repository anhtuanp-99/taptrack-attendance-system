package com.taptrack.service;

import com.taptrack.dto.request.DepartmentRequest;
import com.taptrack.dto.response.DepartmentResponse;
import com.taptrack.entity.Department;
import com.taptrack.exception.*;
import com.taptrack.mapper.DepartmentMapper;
import com.taptrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository repo;
    private final EmployeeRepository employeeRepo;
    private final DepartmentMapper mapper;

    @Transactional
    public DepartmentResponse create(DepartmentRequest req) {
        if (repo.existsByName(req.name())) throw new AppException(ErrorCode.DEPARTMENT_NAME_DUPLICATE);
        return mapper.toResponse(repo.save(Department.builder().name(req.name()).build()));
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> list() {
        return repo.findAll().stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public DepartmentResponse update(Long id, DepartmentRequest req) {
        Department d = repo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));
        if (repo.existsByNameAndIdNot(req.name(), id)) {
            throw new AppException(ErrorCode.DEPARTMENT_NAME_DUPLICATE);
        }
        d.setName(req.name());
        return mapper.toResponse(repo.save(d));
    }

    @Transactional
    public void delete(Long id) {
        Department d = repo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));
        if (employeeRepo.existsByDepartmentId(id)) {
            throw new AppException(ErrorCode.DEPARTMENT_HAS_EMPLOYEES);
        }
        repo.delete(d);
    }
}