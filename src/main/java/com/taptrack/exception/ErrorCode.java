package com.taptrack.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // Card-scan
    UNKNOWN_CARD                (HttpStatus.BAD_REQUEST,  "Thẻ không tồn tại trong hệ thống",                              "The la"),
    EMPLOYEE_INACTIVE           (HttpStatus.FORBIDDEN,    "Nhân viên đã nghỉ việc (INACTIVE)",                            "Nhan vien INACTIVE"),
    NO_SHIFT_TODAY              (HttpStatus.BAD_REQUEST,  "Không có ca làm việc hôm nay",                                  "Khong co ca"),
    ATTENDANCE_ALREADY_COMPLETE (HttpStatus.CONFLICT,     "Đã đủ lượt chấm công hôm nay",                                  "Da du luot"),
    SCAN_CONFLICT               (HttpStatus.CONFLICT,     "Có thao tác chấm công khác đang xử lý, vui lòng quẹt lại",      "Thu lai"),
    DEVICE_KEY_INVALID          (HttpStatus.UNAUTHORIZED, "Device API Key không hợp lệ",                                   null),

    // Auth
    INVALID_CREDENTIALS         (HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng",                                null),
    OLD_PASSWORD_INCORRECT      (HttpStatus.BAD_REQUEST,  "Mật khẩu cũ không đúng",                                        null),
    UNAUTHENTICATED             (HttpStatus.UNAUTHORIZED, "Chưa đăng nhập, token không hợp lệ hoặc đã hết hạn",            null),
    ACCESS_DENIED               (HttpStatus.FORBIDDEN,    "Không có quyền thực hiện thao tác này",                         null),
    EMAIL_DUPLICATE             (HttpStatus.CONFLICT,     "Email đã tồn tại",                                              null),
    ACCOUNT_NOT_FOUND           (HttpStatus.NOT_FOUND,    "Không tìm thấy tài khoản",                                      null),

    // Nghiệp vụ
    CARD_CODE_DUPLICATE          (HttpStatus.CONFLICT,    "Mã thẻ đã được cấp cho nhân viên khác",                         null),
    EMPLOYEE_CODE_DUPLICATE      (HttpStatus.CONFLICT,    "Mã nhân viên đã tồn tại",                                       null),
    EMPLOYEE_NOT_FOUND           (HttpStatus.NOT_FOUND,   "Không tìm thấy nhân viên",                                      null),
    DEPARTMENT_NAME_DUPLICATE    (HttpStatus.CONFLICT,    "Tên phòng ban đã tồn tại",                                      null),
    DEPARTMENT_NOT_FOUND         (HttpStatus.NOT_FOUND,   "Không tìm thấy phòng ban",                                      null),
    DEPARTMENT_HAS_EMPLOYEES     (HttpStatus.CONFLICT,    "Phòng ban vẫn còn nhân viên (kể cả INACTIVE)",                  null),
    SHIFT_TIME_INVALID           (HttpStatus.BAD_REQUEST, "Giờ kết thúc phải sau giờ bắt đầu",                             null),
    SHIFT_TEMPLATE_NOT_FOUND     (HttpStatus.NOT_FOUND,   "Không tìm thấy mẫu ca",                                         null),
    SHIFT_TEMPLATE_IN_USE        (HttpStatus.CONFLICT,    "Mẫu ca đang được phân ca tham chiếu",                           null),
    SHIFT_ASSIGNMENT_NOT_FOUND   (HttpStatus.NOT_FOUND,   "Không tìm thấy phân ca",                                        null),
    SHIFT_ASSIGNMENT_DUPLICATE   (HttpStatus.CONFLICT,    "Nhân viên đã có phân ca cho ngày này",                          null),
    SHIFT_ASSIGNMENT_LOCKED      (HttpStatus.CONFLICT,    "Phân ca đã bị khóa vì đã có bản ghi chấm công",                 null),
    NO_SHIFT_ASSIGNMENT_FOR_DATE (HttpStatus.BAD_REQUEST, "Không thể tạo chấm công cho ngày không có phân ca",             null),
    ATTENDANCE_TIME_INVALID      (HttpStatus.BAD_REQUEST, "Giờ check-in/check-out không hợp lệ",                           null),

    // Chung
    VALIDATION_ERROR (HttpStatus.BAD_REQUEST,            "Dữ liệu đầu vào không hợp lệ (chi tiết trong extraData)",       null),
    INTERNAL_ERROR   (HttpStatus.INTERNAL_SERVER_ERROR,  "Lỗi hệ thống không xác định",                                   "Loi he thong");

    private final HttpStatus status;
    private final String message;
    private final String oledMessage;

    ErrorCode(HttpStatus status, String message, String oledMessage) {
        this.status = status;
        this.message = message;
        this.oledMessage = oledMessage;
    }
}