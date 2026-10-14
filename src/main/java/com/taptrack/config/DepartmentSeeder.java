package com.taptrack.config;

import com.taptrack.entity.Department;
import com.taptrack.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(1)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = false)
public class DepartmentSeeder implements ApplicationRunner {

    private final DepartmentRepository departmentRepo;
    private static final List<String> NAMES = List.of("Backend", "Frontend", "QA");

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (String name : NAMES) {
            if (departmentRepo.existsByName(name)) {
                System.out.println("[Department] Đã có: " + name);
            } else {
                departmentRepo.save(Department.builder().name(name).build());
                System.out.println("[Department] Tạo mới: " + name);
            }
        }
    }
}