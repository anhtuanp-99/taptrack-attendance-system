package com.taptrack.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CardScanRequest {
    @NotBlank(message = "Mã thẻ từ không được để trống")
    private String cardCode;
}