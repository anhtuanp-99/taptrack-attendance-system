package com.taptrack.dto.request;
import jakarta.validation.constraints.*;

public record CardScanRequest(
        @NotBlank(message = "Mã thẻ không được để trống")
        String cardCode) {}