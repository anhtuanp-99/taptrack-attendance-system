package com.taptrack.entity;

import com.taptrack.enums.EmploymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Comment;

/**
 * Hồ sơ nghiệp vụ nhân viên — chỉ tồn tại cho Account có role = EMPLOYEE.
 * Admin không có dòng Employee tương ứng (quan hệ 1-1 tùy chọn với Account).
 */
@Entity
@Table(name = "employees")
@Getter
@Setter
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    @Comment("Liên kết 1-1 tới Account — chỉ tồn tại khi role = EMPLOYEE")
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    @Comment("Phòng ban trực thuộc")
    private Department department;

    @Column(nullable = false, unique = true)
    @Comment("Mã nhân viên nội bộ công ty, duy nhất")
    private String employeeCode;

    // Đặt tên cardCode (không phải cardId) để tránh nhầm là khóa ngoại — xem Changelog_TapTrack.md
    @Column(nullable = false, unique = true)
    @Comment("Mã đọc từ thẻ RFID dùng để chấm công, duy nhất")
    private String cardCode;

    @Comment("Chức danh công việc, chỉ mang tính mô tả, không dùng để phân quyền")
    private String jobTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Comment("ACTIVE/INACTIVE — INACTIVE chặn chấm công và đăng nhập, vẫn giữ lịch sử cũ")
    private EmploymentStatus employmentStatus;
}