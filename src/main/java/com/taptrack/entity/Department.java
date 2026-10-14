package com.taptrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "department",
        uniqueConstraints = @UniqueConstraint(name = "uk_department_name", columnNames = "name"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Department {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist void onCreate() {
        var now = LocalDateTime.now();
        createdAt = now; updatedAt = now;
    }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
}