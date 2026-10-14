package com.taptrack.service;

import com.taptrack.dto.request.*;
import com.taptrack.dto.response.AccountResponse;
import com.taptrack.entity.*;
import com.taptrack.enums.*;
import com.taptrack.exception.*;
import com.taptrack.repository.*;
import com.taptrack.util.CardCodeNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepo;
    private final EmployeeRepository employeeRepo;
    private final DepartmentRepository departmentRepo;
    private final PasswordEncoder passwordEncoder;
    private final CardCodeNormalizer normalizer;

    @Transactional
    public AccountResponse create(AccountCreateRequest req) {
        if (accountRepo.existsByEmail(req.email())) {
            throw new AppException(ErrorCode.EMAIL_DUPLICATE);
        }
        Account acc = Account.builder()
                .email(req.email())
                .fullName(req.fullName())
                .passwordHash(passwordEncoder.encode(req.initialPassword()))
                .role(req.role())
                .build();
        accountRepo.save(acc);

        // Role ADMIN: không cần hồ sơ Employee
        if (req.role() == Role.EMPLOYEE) {
            if (req.employeeProfile() == null) {
                // Yêu cầu phải có hồ sơ khi tạo Employee
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            }
            var p = req.employeeProfile();
            if (employeeRepo.existsByEmployeeCode(p.employeeCode())) {
                throw new AppException(ErrorCode.EMPLOYEE_CODE_DUPLICATE);
            }
            String normalizedCard = normalizer.normalize(p.cardCode());
            if (employeeRepo.existsByCardCode(normalizedCard)) {
                throw new AppException(ErrorCode.CARD_CODE_DUPLICATE);
            }
            Department dept = departmentRepo.findById(p.departmentId())
                    .orElseThrow(() -> new AppException(ErrorCode.DEPARTMENT_NOT_FOUND));

            employeeRepo.save(Employee.builder()
                    .account(acc)
                    .department(dept)
                    .employeeCode(p.employeeCode())
                    .cardCode(normalizedCard)
                    .jobTitle(p.jobTitle())
                    .employmentStatus(EmploymentStatus.ACTIVE)
                    .build());
        }
        return new AccountResponse(acc.getId(), acc.getEmail(), acc.getFullName(), acc.getRole());
    }

    @Transactional
    public void resetPassword(Long accountId, ResetPasswordRequest req) {
        Account acc = accountRepo.findById(accountId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        acc.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        accountRepo.save(acc);
    }
}