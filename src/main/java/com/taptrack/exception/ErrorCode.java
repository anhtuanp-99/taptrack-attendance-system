package com.taptrack.exception;

import org.springframework.http.HttpStatus;

/**
 * Danh mục toàn bộ mã lỗi nghiệp vụ của hệ thống.
 * Thêm lỗi mới ở đây, không tạo class Exception riêng — xem {@link AppException}.
 */
public enum ErrorCode {

    EMPLOYEE_PROFILE_REQUIRED(HttpStatus.BAD_REQUEST, "Thiếu thông tin hồ sơ nhân viên"),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ"),

    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Sai email hoặc mật khẩu"),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ hoặc đã hết hạn"),

    FORBIDDEN(HttpStatus.FORBIDDEN, "Không đủ quyền truy cập"),

    UNKNOWN_CARD(HttpStatus.NOT_FOUND, "Thẻ không tồn tại trong hệ thống"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy dữ liệu"),

    NO_SHIFT_TODAY(HttpStatus.CONFLICT, "Nhân viên không được phân ca hôm nay"),
    ALREADY_COMPLETED(HttpStatus.CONFLICT, "Đã chấm công đủ 2 lượt hôm nay"),
    DEPARTMENT_NOT_EMPTY(HttpStatus.CONFLICT, "Không thể xóa phòng ban còn nhân viên"),
    SHIFT_TEMPLATE_IN_USE(HttpStatus.CONFLICT, "Không thể xóa mẫu ca đang được tham chiếu"),
    SHIFT_ASSIGNMENT_LOCKED(HttpStatus.CONFLICT, "Không thể sửa/xóa phân ca đã qua ngày hoặc đã có chấm công thật"),
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT, "Dữ liệu đã tồn tại"),

    EMPLOYEE_INACTIVE(HttpStatus.LOCKED, "Tài khoản đã bị vô hiệu hóa"),

    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống không lường trước");

    private final HttpStatus httpStatus;
    private final String defaultMessage;

    ErrorCode(HttpStatus httpStatus, String defaultMessage) {
        this.httpStatus = httpStatus;
        this.defaultMessage = defaultMessage;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}