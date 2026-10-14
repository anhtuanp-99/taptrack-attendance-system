package com.taptrack.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private String errorCode;
    private T data;

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder()
                .success(true).message("Thành công").data(data).build();
    }
    public static <T> ApiResponse<T> ok() { return ok(null); }

    public static <T> ApiResponse<T> fail(String code, String message, T extra) {
        return ApiResponse.<T>builder()
                .success(false).errorCode(code).message(message).data(extra).build();
    }
}