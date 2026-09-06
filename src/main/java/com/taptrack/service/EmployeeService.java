// EmployeeService.java
package com.taptrack.service;

import com.taptrack.dto.request.AccountCreateRequest;
import com.taptrack.dto.request.EmployeeUpdateRequest;
import com.taptrack.dto.response.EmployeeResponse;
import com.taptrack.entity.Account;
import com.taptrack.entity.Department;
import com.taptrack.entity.Employee;
import com.taptrack.enums.EmploymentStatus;
import com.taptrack.enums.Role;
import com.taptrack.exception.AppException;
import com.taptrack.exception.ErrorCode;
import com.taptrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final AccountRepository accountRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final PasswordEncoder passwordEncoder;

    private String normalizeCardCode(String cardCode) {
        return cardCode != null ? cardCode.trim().replaceAll("\\s+", "").toUpperCase() : "";
    }

    @Transactional
    public EmployeeResponse createAccountWithEmployee(AccountCreateRequest request) {
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.DUPLICATE_EMAIL);
        }

        Account account = Account.builder()
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .role(request.getRole())
                .build();

        Account savedAccount = accountRepository.save(account);

        if (request.getRole() == Role.EMPLOYEE) {
            if (request.getEmployeeProfile() == null) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Thiếu thông tin hồ sơ nhân viên");
            }

            var profile = request.getEmployeeProfile();
            String normalizedCard = normalizeCardCode(profile.getCardCode());

            if (employeeRepository.existsByEmployeeCode(profile.getEmployeeCode())) {
                throw new AppException(ErrorCode.DUPLICATE_EMPLOYEE_CODE);
            }

            if (employeeRepository.existsByCardCode(normalizedCard)) {
                throw new AppException(ErrorCode.DUPLICATE_CARD_CODE);
            }

            Department department = departmentRepository.findById(profile.getDepartmentId())
                    .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

            Employee employee = Employee.builder()
                    .account(savedAccount)
                    .department(department)
                    .employeeCode(profile.getEmployeeCode().trim())
                    .cardCode(normalizedCard)
                    .jobTitle(profile.getJobTitle())
                    .employmentStatus(EmploymentStatus.ACTIVE)
                    .build();

            Employee savedEmp = employeeRepository.save(employee);
            return mapToResponse(savedEmp);
        }

        return EmployeeResponse.builder()
                .accountId(savedAccount.getId())
                .email(savedAccount.getEmail())
                .fullName(savedAccount.getFullName())
                .build();
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND));

        String normalizedCard = normalizeCardCode(request.getCardCode());
        if (employeeRepository.existsByCardCodeAndIdNot(normalizedCard, id)) {
            throw new AppException(ErrorCode.DUPLICATE_CARD_CODE);
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

        employee.getAccount().setFullName(request.getFullName().trim());
        employee.setDepartment(department);
        employee.setCardCode(normalizedCard);
        employee.setJobTitle(request.getJobTitle());

        return mapToResponse(employeeRepository.save(employee));
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND));

        boolean hasAttendance = attendanceRecordRepository.existsByEmployeeId(id);

        if (hasAttendance) {
            // Chuyển status sang INACTIVE để giữ dữ liệu lịch sử
            employee.setEmploymentStatus(EmploymentStatus.INACTIVE);
            employeeRepository.save(employee);
        } else {
            // Xóa cứng: Cascade xóa phân ca và Account liên kết
            shiftAssignmentRepository.deleteByEmployeeId(id);
            Long accountId = employee.getAccount().getId();
            employeeRepository.delete(employee);
            accountRepository.deleteById(accountId);
        }
    }

    private EmployeeResponse mapToResponse(Employee emp) {
        return EmployeeResponse.builder()
                .id(emp.getId())
                .accountId(emp.getAccount().getId())
                .email(emp.getAccount().getEmail())
                .fullName(emp.getAccount().getFullName())
                .departmentId(emp.getDepartment().getId())
                .departmentName(emp.getDepartment().getName())
                .employeeCode(emp.getEmployeeCode())
                .cardCode(emp.getCardCode())
                .jobTitle(emp.getJobTitle())
                .employmentStatus(emp.getEmploymentStatus())
                .createdAt(emp.getCreatedAt())
                .build();
    }
}