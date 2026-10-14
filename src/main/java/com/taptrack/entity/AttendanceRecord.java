package com.taptrack.entity;

import com.taptrack.enums.CheckInStatus;
import com.taptrack.enums.CheckOutStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_record",
        uniqueConstraints = @UniqueConstraint(name = "uk_attendance_employee_date",
                columnNames = {"employee_id", "work_date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttendanceRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "check_in_time", nullable = false)
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "check_in_status", length = 20)
    private CheckInStatus checkInStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "check_out_status", length = 20)
    private CheckOutStatus checkOutStatus;

    @Column(name = "late_minutes")
    private Integer lateMinutes;

    @Column(name = "early_leave_minutes")
    private Integer earlyLeaveMinutes;

    @Column(name = "is_manual_edit", nullable = false)
    private boolean isManualEdit = false;

    @Column(name = "edited_by_account_id")
    private Long editedByAccountId;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    @Column(name = "edit_reason", length = 500)
    private String editReason;
}