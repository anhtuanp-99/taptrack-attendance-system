package com.taptrack.enums;

/** Phân quyền của Account — dùng chung 1 bảng Account cho cả 2 role (FR-3.1). */
public enum Role {

    /** Nhân viên — chấm công qua thẻ, xem lịch sử/lịch làm việc cá nhân. */
    EMPLOYEE,

    /** Quản trị viên — toàn quyền quản lý phòng ban, nhân viên, ca làm việc, báo cáo. */
    ADMIN
}