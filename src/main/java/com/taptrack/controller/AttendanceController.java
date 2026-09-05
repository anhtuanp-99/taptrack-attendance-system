package com.taptrack.controller;

import com.taptrack.dto.request.CardScanRequest;
import com.taptrack.dto.response.ApiResponse;
import com.taptrack.dto.response.CardScanResponse;
import com.taptrack.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/card-scan")
    public ResponseEntity<ApiResponse<CardScanResponse>> scanCard(@Valid @RequestBody CardScanRequest request) {
        CardScanResponse response = attendanceService.processCardScan(request);
        return ResponseEntity.ok(ApiResponse.success("Xử lý quét thẻ thành công", response));
    }
}