package com.taptrack.repository;

import com.taptrack.entity.ShiftTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShiftTemplateRepository extends JpaRepository<ShiftTemplate, Long> {
    boolean existsByName(String name);
}