package com.taptrack.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // General Errors
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống nội bộ"),
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "Dữ liệu yêu cầu không hợp lệ"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Xác thực không thành công"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện thao tác này"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên yêu cầu"),

    // Auth Errors
    INVALID_CREDENTIALS(HttpStatus.BAD_REQUEST, "Email hoặc mật khẩu không chính xác"),
    INVALID_REFRESH_TOKEN(HttpStatus.BAD_REQUEST, "Refresh token không hợp lệ hoặc đã hết hạn"),
    OLD_PASSWORD_INCORRECT(HttpStatus.BAD_REQUEST, "Mật khẩu cũ không chính xác"),

    // Department & Employee Errors
    DEPARTMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "Phòng ban không tồn tại"),
    DEPARTMENT_HAS_EMPLOYEES(HttpStatus.BAD_REQUEST, "Không thể xóa phòng ban đang chứa nhân viên"),
    EMPLOYEE_NOT_FOUND(HttpStatus.NOT_FOUND, "Nhân viên không tồn tại"),
    EMPLOYEE_INACTIVE(HttpStatus.FORBIDDEN, "Tài khoản nhân viên đã bị vô hiệu hóa"),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "Email đã được sử dụng trong hệ thống"),
    DUPLICATE_EMPLOYEE_CODE(HttpStatus.CONFLICT, "Mã nhân viên đã tồn tại"),
    DUPLICATE_CARD_CODE(HttpStatus.CONFLICT, "Mã thẻ từ đã được gán cho nhân viên khác"),
    CANNOT_DELETE_EMPLOYEE_WITH_ATTENDANCE(HttpStatus.BAD_REQUEST, "Không thể xóa nhân viên đã có lịch sử chấm công, vui lòng chuyển sang INACTIVE"),

    // Shift Errors
    SHIFT_TEMPLATE_NOT_FOUND(HttpStatus.NOT_FOUND, "Mẫu ca làm việc không tồn tại"),
    SHIFT_TEMPLATE_IN_USE(HttpStatus.BAD_REQUEST, "Không thể xóa mẫu ca đang được áp dụng phân ca"),
    SHIFT_ASSIGNMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "Phân ca không tồn tại"),
    NO_SHIFT_ASSIGNED(HttpStatus.BAD_REQUEST, "Nhân viên không có ca làm việc trong ngày hôm nay"),
    SHIFT_ASSIGNMENT_LOCKED(HttpStatus.BAD_REQUEST, "Phân ca đã có bản ghi chấm công, không thể sửa/xóa"),
    INVALID_SHIFT_CONFIG(HttpStatus.BAD_REQUEST, "Cấu hình ca làm việc không hợp lệ (Phải chọn mẫu ca HOẶC giờ tùy chỉnh, giờ kết thúc phải sau giờ bắt đầu)"),

    // Attendance Errors
    UNKNOWN_CARD(HttpStatus.NOT_FOUND, "Thẻ từ lạ, không tìm thấy nhân viên"),
    ATTENDANCE_RECORD_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi chấm công"),
    ATTENDANCE_LIMIT_EXCEEDED(HttpStatus.CONFLICT, "Nhân viên đã thực hiện đủ lượt check-in và check-out trong ngày"),
    ATTENDANCE_ALREADY_EXISTS(HttpStatus.CONFLICT, "Đã tồn tại bản ghi chấm công cho ngày này");

    private final HttpStatus httpStatus;
    private final String defaultMessage;

    ErrorCode(HttpStatus httpStatus, String defaultMessage) {
        this.httpStatus = httpStatus;
        this.defaultMessage = defaultMessage;
    }
}