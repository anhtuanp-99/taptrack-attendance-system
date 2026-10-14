package com.taptrack.service;

import com.taptrack.dto.request.*;
import com.taptrack.dto.response.LoginResponse;
import com.taptrack.entity.Account;
import com.taptrack.enums.EmploymentStatus;
import com.taptrack.enums.Role;
import com.taptrack.exception.*;
import com.taptrack.repository.*;
import com.taptrack.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AccountRepository accountRepo;
    private final EmployeeRepository employeeRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwt;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest req) {
        Account acc = accountRepo.findByEmail(req.email()).orElse(null);
        if (acc == null || !passwordEncoder.matches(req.password(), acc.getPasswordHash())) {
            log.warn("Login thất bại (sai credentials) cho email={}", req.email());
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        // Nhân viên INACTIVE: không cho đăng nhập, trả cùng INVALID_CREDENTIALS
        if (acc.getRole() == Role.EMPLOYEE) {
            var emp = employeeRepo.findByAccountId(acc.getId()).orElse(null);
            if (emp != null && emp.getEmploymentStatus() == EmploymentStatus.INACTIVE) {
                log.info("Login bị từ chối (INACTIVE) cho email={}", req.email());
                throw new AppException(ErrorCode.INVALID_CREDENTIALS);
            }
        }
        String token = jwt.generate(acc.getId(), acc.getEmail(), acc.getRole());
        return new LoginResponse(token, jwt.getTtlSeconds(), acc.getRole());
    }

    @Transactional
    public void changePassword(Long accountId, ChangePasswordRequest req) {
        Account acc = accountRepo.findById(accountId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        if (!passwordEncoder.matches(req.oldPassword(), acc.getPasswordHash())) {
            throw new AppException(ErrorCode.OLD_PASSWORD_INCORRECT);
        }
        acc.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        accountRepo.save(acc);
    }
}