package com.taptrack.config;

import com.taptrack.entity.*;
import com.taptrack.enums.EmploymentStatus;
import com.taptrack.repository.*;
import com.taptrack.util.CardCodeNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(4)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = false)
public class EmployeeSeeder implements ApplicationRunner {

    /** { email, employeeCode, cardCode, departmentName, jobTitle } */
    private static final String[][] PROFILES = {
            { "nv01@taptrack.local", "NV001", "CARD-0001", "Backend",  "Backend Developer" },
            { "nv02@taptrack.local", "NV002", "CARD-0002", "Frontend", "Frontend Developer" },
            { "nv03@taptrack.local", "NV003", "CARD-0003", "QA",       "QA Engineer" },
    };

    private final AccountRepository accountRepo;
    private final EmployeeRepository employeeRepo;
    private final DepartmentRepository departmentRepo;
    private final CardCodeNormalizer normalizer;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (String[] row : PROFILES) {
            String email = row[0];
            String cardCode = normalizer.normalize(row[2]);

            Account acc = accountRepo.findByEmail(email).orElse(null);
            if (acc == null) {
                System.out.println("[Employee] Bỏ qua (không có Account): " + email);
                continue;
            }
            if (employeeRepo.findByAccountId(acc.getId()).isPresent()) {
                System.out.println("[Employee] Đã có: " + email);
                continue;
            }

            Department dept = departmentRepo.findAll().stream()
                    .filter(d -> d.getName().equals(row[3]))
                    .findFirst().orElse(null);
            if (dept == null) {
                System.out.println("[Employee] Bỏ qua (không có Department): " + email);
                continue;
            }
            if (employeeRepo.existsByEmployeeCode(row[1]) || employeeRepo.existsByCardCode(cardCode)) {
                System.out.println("[Employee] Bỏ qua (trùng code/card): " + email);
                continue;
            }

            employeeRepo.save(Employee.builder()
                    .account(acc)
                    .department(dept)
                    .employeeCode(row[1])
                    .cardCode(cardCode)
                    .jobTitle(row[4])
                    .employmentStatus(EmploymentStatus.ACTIVE)
                    .build());
            System.out.println("[Employee] Tạo mới: " + email + " | " + row[1] + " | " + cardCode);
        }
    }
}