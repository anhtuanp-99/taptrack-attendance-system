package com.taptrack.controller;

import com.taptrack.dto.request.CardScanRequest;
import com.taptrack.dto.response.CardScanResponse;
import com.taptrack.service.CardScanResult;
import com.taptrack.service.CardScanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final CardScanService cardScanService;

    /**
     * Trả thẳng CardScanResponse (KHÔNG bọc ApiResponse) — ESP32 parse trực tiếp.
     * HttpStatus phản ánh đúng ErrorCode (200/400/403/409).
     */
    @PostMapping("/card-scan")
    public ResponseEntity<CardScanResponse> cardScan(@Valid @RequestBody CardScanRequest req) {
        CardScanResult result = cardScanService.scan(req.cardCode());
        return ResponseEntity.status(result.status()).body(result.body());
    }
}