package com.taptrack.enums;

/** Trạng thái làm việc của Employee — INACTIVE chặn chấm công và đăng nhập (FR-2.6). */
public enum EmploymentStatus {

    /** Đang làm việc, được phép chấm công và đăng nhập bình thường. */
    ACTIVE,

    /** Đã nghỉ việc — không thể chấm công (ESP32 từ chối), không thể đăng nhập, vẫn giữ lịch sử cũ. */
    INACTIVE
}