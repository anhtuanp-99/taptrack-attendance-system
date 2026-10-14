package com.taptrack.controller.employee;

import com.taptrack.dto.response.*;
import com.taptrack.exception.AppException;
import com.taptrack.exception.ErrorCode;
import com.taptrack.repository.EmployeeRepository;
import com.taptrack.security.UserPrincipal;
import com.taptrack.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/employee")
@RequiredArgsConstructor
public class MyAttendanceController {

    private final AttendanceService attendanceService;
    private final ShiftService shiftService;
    private final EmployeeRepository employeeRepo;

    @GetMapping("/my-attendance")
    public ApiResponse<PageResponse<MyAttendanceResponse>> myAttendance(
            @AuthenticationPrincipal UserPrincipal p,
            @RequestParam String from, @RequestParam String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long empId = currentEmployeeId(p);
        return ApiResponse.ok(PageResponse.from(attendanceService.myHistory(
                empId, LocalDate.parse(from), LocalDate.parse(to), page, size)));
    }

    @GetMapping("/my-schedule/week")
    public ApiResponse<WeeklyScheduleResponse> mySchedule(
            @AuthenticationPrincipal UserPrincipal p,
            @RequestParam String weekStart) {
        return ApiResponse.ok(shiftService.weeklySchedule(
                currentEmployeeId(p), LocalDate.parse(weekStart)));
    }

    private Long currentEmployeeId(UserPrincipal p) {
        return employeeRepo.findByAccountId(p.getId())
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND))
                .getId();
    }
}