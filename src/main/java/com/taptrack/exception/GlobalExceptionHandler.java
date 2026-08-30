package com.taptrack.exception;

import com.taptrack.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Bắt toàn bộ exception ném ra từ Controller/Service, chuyển về đúng khuôn dạng
 * ApiResponse (success=false) cho mọi lỗi — không để lộ trang lỗi mặc định của Spring.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Object>> handleAppException(AppException ex) {
        log.warn("event=APP_EXCEPTION errorCode={} message={}", ex.getErrorCode(), ex.getMessage());
        ApiResponse<Object> body = ApiResponse.error(ex.getErrorCode().name(), ex.getMessage(), ex.getExtraData());
        return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(body);
    }

    // Lỗi từ @Valid trên @RequestBody — lấy message đầu tiên trong các field lỗi để trả gọn
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse(ErrorCode.INVALID_REQUEST.getDefaultMessage());
        log.warn("event=VALIDATION_ERROR message={}", message);
        return ResponseEntity.badRequest().body(ApiResponse.error(ErrorCode.INVALID_REQUEST.name(), message));
    }

    // Lỗi từ @Validated trên @RequestParam/@PathVariable (khác @Valid ở @RequestBody phía trên)
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(ConstraintViolationException ex) {
        log.warn("event=VALIDATION_ERROR message={}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(ErrorCode.INVALID_REQUEST.name(), ErrorCode.INVALID_REQUEST.getDefaultMessage()));
    }

    // Lưới an toàn cuối cùng — mọi exception không lường trước, không để lộ chi tiết kỹ thuật ra ngoài
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUnexpected(Exception ex) {
        log.error("event=UNEXPECTED_ERROR message={}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(ErrorCode.INTERNAL_ERROR.name(), ErrorCode.INTERNAL_ERROR.getDefaultMessage()));
    }
}