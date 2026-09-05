package com.taptrack.exception;

import lombok.Getter;

@Getter
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;
    private final Object extraData;

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

    public AppException(ErrorCode errorCode, String customMessage, Object extraData) {
        super(customMessage);
        this.errorCode = errorCode;
        this.extraData = extraData;
    }
}