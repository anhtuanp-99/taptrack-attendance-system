package com.taptrack.exception;

import lombok.Getter;

import java.util.Map;

/**
 * Exception nghiệp vụ dùng chung cho toàn hệ thống — thay thế việc tạo 1 class
 * riêng cho mỗi loại lỗi. Mỗi lỗi được phân biệt bằng {@link ErrorCode}, không
 * phải bằng kiểu Exception.
 */
@Getter
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;

    // Dữ liệu bổ sung đi kèm response lỗi, ví dụ ledCommand cho lỗi quẹt thẻ
    // (API Spec mục 1: lỗi vẫn phải trả data.ledCommand, khác các lỗi thường có data=null)
    private final Map<String, Object> extraData;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
        this.extraData = null;
    }

    public AppException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.extraData = null;
    }

    public AppException(ErrorCode errorCode, Map<String, Object> extraData) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
        this.extraData = extraData;
    }
}