package com.taptrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "shift_assignment",
        uniqueConstraints = @UniqueConstraint(name = "uk_shift_assignment",
                columnNames = {"employee_id", "work_date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShiftAssignment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shift_template_id", nullable = false)
    private ShiftTemplate shiftTemplate;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;
}