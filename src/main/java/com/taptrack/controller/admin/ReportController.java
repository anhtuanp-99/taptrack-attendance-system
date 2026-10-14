package com.taptrack.controller.admin;

import com.taptrack.dto.response.*;
import com.taptrack.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService service;

    @GetMapping("/dashboard/today")
    public ApiResponse<DashboardTodayResponse> dashboard(
            @RequestParam(required = false) Long departmentId) {
        return ApiResponse.ok(service.dashboard(departmentId));
    }

    @GetMapping("/reports/monthly")
    public ApiResponse<List<MonthlyReportResponse>> monthly(
            @RequestParam int year, @RequestParam int month,
            @RequestParam(required = false) Long departmentId) {
        return ApiResponse.ok(service.monthly(year, month, departmentId));
    }

    @GetMapping("/reports/absent-today")
    public ApiResponse<List<AbsentEmployeeResponse>> absent(
            @RequestParam(required = false) Long departmentId) {
        return ApiResponse.ok(service.absentToday(departmentId));
    }
}