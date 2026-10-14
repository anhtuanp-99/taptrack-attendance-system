package com.taptrack.service;

import com.taptrack.dto.request.EmployeeUpdateRequest;
import com.taptrack.dto.response.EmployeeResponse;
import com.taptrack.entity.*;
import com.taptrack.enums.EmploymentStatus;
import com.taptrack.exception.*;
import com.taptrack.mapper.EmployeeMapper;
import com.taptrack.repository.*;
import com.taptrack.util.CardCodeNormalizer;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepo;
    private final DepartmentRepository departmentRepo;
    private final EmployeeMapper mapper;
    private final CardCodeNormalizer normalizer;

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> list(Long departmentId, String status, int page, int size) {
        EmploymentStatus statusEnum = parseStatus(status);
        Specification<Employee> spec = (root, q, cb) -> {
            var ps = new ArrayList<Predicate>();
            if (departmentId != null) ps.add(cb.equal(root.get("department").get("id"), departmentId));
            if (statusEnum != null)   ps.add(cb.equal(root.get("employmentStatus"), statusEnum));
            return cb.and(ps.toArray(new Predicate[0]));
        };
        Pageable p = PageRequest.of(page, size, Sort.by("id").descending());
        return employeeRepo.findAll(spec, p).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse get(Long id) {
        return mapper.toResponse(employeeRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND)));
    }

    @Transactional
    public EmployeeResponse update(Long id, EmployeeUpdateRequest req) {
        Employee e = employeeRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND));
        Department d = departmentRepo.findById(req.departmentId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));
        String normalized = normalizer.normalize(req.cardCode());
        if (employeeRepo.existsByCardCodeAndIdNot(normalized, id)) {
            throw new AppException(ErrorCode.CARD_CODE_DUPLICATE);
        }
        e.getAccount().setFullName(req.fullName());
        e.setDepartment(d);
        e.setJobTitle(req.jobTitle());
        e.setCardCode(normalized);
        e.setEmploymentStatus(req.employmentStatus());
        return mapper.toResponse(employeeRepo.save(e));
    }

    /** Bắt IllegalArgumentException từ Enum.valueOf để trả về VALIDATION_ERROR thay vì 500. */
    private EmploymentStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return null;
        try {
            return EmploymentStatus.valueOf(status);
        } catch (IllegalArgumentException ex) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
    }
}