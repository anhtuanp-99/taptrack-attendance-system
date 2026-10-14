package com.taptrack.exception;

import com.taptrack.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleApp(AppException ex) {
        ErrorCode ec = ex.getErrorCode();
        return ResponseEntity.status(ec.getStatus())
                .body(ApiResponse.fail(ec.name(), ec.getMessage(), ex.getExtraData()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> fields = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fields.put(fe.getField(), fe.getDefaultMessage());
        }
        return ResponseEntity.status(ErrorCode.VALIDATION_ERROR.getStatus())
                .body(ApiResponse.fail(ErrorCode.VALIDATION_ERROR.name(),
                        ErrorCode.VALIDATION_ERROR.getMessage(), fields));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(ErrorCode.ACCESS_DENIED.getStatus())
                .body(ApiResponse.fail(ErrorCode.ACCESS_DENIED.name(),
                        ErrorCode.ACCESS_DENIED.getMessage(), null));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuth(AuthenticationException ex) {
        return ResponseEntity.status(ErrorCode.UNAUTHENTICATED.getStatus())
                .body(ApiResponse.fail(ErrorCode.UNAUTHENTICATED.name(),
                        ErrorCode.UNAUTHENTICATED.getMessage(), null));
    }

    /**
     * Bắt khi URL không khớp với controller nào — Spring ném NoResourceFoundException.
     * Trả về 404 sạch thay vì 500 + log ầm ĩ.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NoResourceFoundException ex) {
        log.warn("404 - Không tìm thấy endpoint: {}", ex.getResourcePath());
        return ResponseEntity.status(404)
                .body(ApiResponse.fail("NOT_FOUND",
                        "Không tìm thấy endpoint: " + ex.getResourcePath(), null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleOther(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(ErrorCode.INTERNAL_ERROR.getStatus())
                .body(ApiResponse.fail(ErrorCode.INTERNAL_ERROR.name(),
                        ErrorCode.INTERNAL_ERROR.getMessage(), null));
    }
}