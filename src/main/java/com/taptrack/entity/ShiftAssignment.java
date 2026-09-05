package com.taptrack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(
        name = "shift_assignments",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_shift_assignment_employee_date", columnNames = {"employee_id", "work_date"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false, foreignKey = @ForeignKey(name = "fk_assignment_employee"))
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_template_id", foreignKey = @ForeignKey(name = "fk_assignment_template"))
    private ShiftTemplate shiftTemplate;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "custom_start_time")
    private LocalTime customStartTime;

    @Column(name = "custom_end_time")
    private LocalTime customEndTime;
}