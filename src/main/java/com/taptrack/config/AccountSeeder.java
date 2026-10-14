package com.taptrack.config;

import com.taptrack.entity.Account;
import com.taptrack.enums.Role;
import com.taptrack.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(3)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = false)
public class AccountSeeder implements ApplicationRunner {

    static final String PASSWORD = "Employee@123";
    static final String[][] EMPLOYEES = {
            { "nv01@taptrack.local", "Nguyễn Văn An" },
            { "nv02@taptrack.local", "Trần Thị Bình" },
            { "nv03@taptrack.local", "Lê Hoàng Cường" },
    };

    private final AccountRepository accountRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (String[] row : EMPLOYEES) {
            String email = row[0];
            if (accountRepo.existsByEmail(email)) {
                System.out.println("[Account] Đã có: " + email);
            } else {
                accountRepo.save(Account.builder()
                        .email(email)
                        .fullName(row[1])
                        .passwordHash(passwordEncoder.encode(PASSWORD))
                        .role(Role.EMPLOYEE)
                        .build());
                System.out.println("[Account] Tạo mới: " + email + " / " + PASSWORD);
            }
        }
    }
}