package com.taptrack.entity;

import com.taptrack.enums.CheckInStatus;
import com.taptrack.enums.CheckOutStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "attendance_records",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_attendance_employee_date", columnNames = {"employee_id", "work_date"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false, foreignKey = @ForeignKey(name = "fk_attendance_employee"))
    private Employee employee;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "check_in_status", length = 20)
    private CheckInStatus checkInStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "check_out_status", length = 20)
    private CheckOutStatus checkOutStatus;

    @Column(name = "is_manual_edit", nullable = false)
    @Builder.Default
    private Boolean isManualEdit = false;
}