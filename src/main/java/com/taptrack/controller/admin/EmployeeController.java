package com.taptrack.controller.admin;

import com.taptrack.dto.request.EmployeeUpdateRequest;
import com.taptrack.dto.response.*;
import com.taptrack.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final ShiftService shiftService;

    @GetMapping("/employees")
    public ApiResponse<PageResponse<EmployeeResponse>> list(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String employmentStatus,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(PageResponse.from(
                employeeService.list(departmentId, employmentStatus, page, size)));
    }

    @GetMapping("/employees/{id}")
    public ApiResponse<EmployeeResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(employeeService.get(id));
    }

    @PutMapping("/employees/{id}")
    public ApiResponse<EmployeeResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody EmployeeUpdateRequest req) {
        return ApiResponse.ok(employeeService.update(id, req));
    }

    @GetMapping("/employees/{id}/schedule/week")
    public ApiResponse<WeeklyScheduleResponse> schedule(@PathVariable Long id,
                                                        @RequestParam String weekStart) {
        return ApiResponse.ok(shiftService.weeklySchedule(id, LocalDate.parse(weekStart)));
    }
}