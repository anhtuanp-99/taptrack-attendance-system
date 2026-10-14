package com.taptrack.exception;

import lombok.Getter;
import java.util.Map;

@Getter
public class AppException extends RuntimeException {
    private final ErrorCode errorCode;
    private final Map<String, Object> extraData;

    public AppException(ErrorCode errorCode) { this(errorCode, null); }

    public AppException(ErrorCode errorCode, Map<String, Object> extraData) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.extraData = extraData;
    }
}