package com.taptrack.entity;

import com.taptrack.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Comment;

/**
 * Tài khoản đăng nhập dùng chung cho mọi role (Employee lẫn Admin).
 * Tách riêng khỏi {@link Employee} vì Admin không có hồ sơ nghiệp vụ đi kèm.
 * Xem ERD_TapTrack.txt và Changelog_TapTrack.md (mục "Quyết định thiết kế dữ liệu").
 */
@Entity
@Table(name = "accounts")
@Getter
@Setter
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    @Comment("Email dùng để đăng nhập, duy nhất toàn hệ thống")
    private String email;

    @Column(nullable = false)
    @Comment("Mật khẩu đã hash BCrypt")
    private String passwordHash;

    // Đặt ở Account (không phải Employee) vì Admin cũng cần tên hiển thị khi đăng nhập
    @Column(nullable = false)
    @Comment("Họ tên hiển thị, dùng chung cho mọi role")
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Comment("Phân quyền: EMPLOYEE hoặc ADMIN")
    private Role role;
}