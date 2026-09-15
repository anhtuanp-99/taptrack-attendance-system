package com.taptrack.service;

import com.taptrack.dto.request.LoginRequest;
import com.taptrack.dto.response.LoginResponse;
import com.taptrack.entity.Account;
import com.taptrack.exception.AppException;
import com.taptrack.exception.ErrorCode;
import com.taptrack.repository.AccountRepository;
import com.taptrack.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider tokenProvider;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Account account = accountRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        String accessToken = tokenProvider.generateAccessToken(account.getEmail(), account.getRole().name());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .role(account.getRole())
                .fullName(account.getFullName())
                .email(account.getEmail())
                .build();
    }
}