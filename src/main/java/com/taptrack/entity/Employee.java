package com.taptrack.entity;

import com.taptrack.enums.EmploymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_employee_account", columnNames = "account_id"),
                @UniqueConstraint(name = "uk_employee_code",    columnNames = "employee_code"),
                @UniqueConstraint(name = "uk_employee_card",    columnNames = "card_code")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Employee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "employee_code", nullable = false, length = 50)
    private String employeeCode;

    @Column(name = "card_code", nullable = false, length = 64)
    private String cardCode;

    @Column(name = "job_title", length = 100)
    private String jobTitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_status", nullable = false, length = 20)
    private EmploymentStatus employmentStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist void onCreate() {
        var now = LocalDateTime.now();
        createdAt = now; updatedAt = now;
        if (employmentStatus == null) employmentStatus = EmploymentStatus.ACTIVE;
    }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
}