package com.taptrack.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Comment;

/**
 * Danh mục phòng ban (FR-1). Không cho xóa nếu còn Employee thuộc phòng ban này (FR-1.2)
 * — ràng buộc kiểm tra ở tầng Service, không thể diễn tả bằng schema thuần.
 */
@Entity
@Table(name = "departments")
@Getter
@Setter
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    @Comment("Tên phòng ban, duy nhất trong hệ thống")
    private String name;
}