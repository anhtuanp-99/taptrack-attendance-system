package com.taptrack.service;

import com.taptrack.dto.response.CardScanResponse;
import org.springframework.http.HttpStatus;

/**
 * Kết quả card-scan: luôn mang CardScanResponse (kể cả khi lỗi) + HttpStatus tương ứng.
 * Controller unwrap ra ResponseEntity<CardScanResponse>.
 */
public record CardScanResult(CardScanResponse body, HttpStatus status) {

    public static CardScanResult ok(CardScanResponse body) {
        return new CardScanResult(body, HttpStatus.OK);
    }
    public static CardScanResult of(CardScanResponse body, HttpStatus status) {
        return new CardScanResult(body, status);
    }
}