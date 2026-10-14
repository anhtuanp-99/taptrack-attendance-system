package com.taptrack.controller.admin;

import com.taptrack.dto.request.AttendanceManualEditRequest;
import com.taptrack.dto.response.*;
import com.taptrack.repository.UnknownCardLogRepository;
import com.taptrack.security.UserPrincipal;
import com.taptrack.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/admin/attendance")
@RequiredArgsConstructor
public class AdminAttendanceController {

    private final AttendanceService attendanceService;
    private final UnknownCardLogRepository unknownRepo;

    @GetMapping
    public ApiResponse<PageResponse<MyAttendanceResponse>> list(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(PageResponse.from(attendanceService.adminHistory(
                employeeId, departmentId, LocalDate.parse(from), LocalDate.parse(to), page, size)));
    }

    @PostMapping("/manual-edit")
    public ApiResponse<AttendanceManualEditResponse> manualEdit(
            @AuthenticationPrincipal UserPrincipal p,
            @Valid @RequestBody AttendanceManualEditRequest req) {
        return ApiResponse.ok(attendanceService.manualEdit(p.getId(), req));
    }

    @GetMapping("/unknown-cards")
    public ApiResponse<PageResponse<UnknownCardResponse>> unknownCards(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        LocalDateTime f = (from == null) ? LocalDateTime.now().minusYears(1) : LocalDate.parse(from).atStartOfDay();
        LocalDateTime t = (to == null)   ? LocalDateTime.now().plusDays(1) : LocalDate.parse(to).atTime(23, 59, 59);
        Pageable pg = PageRequest.of(page, size, Sort.by("scanTime").descending());
        return ApiResponse.ok(PageResponse.from(
                unknownRepo.findByScanTimeBetween(f, t, pg)
                        .map(u -> new UnknownCardResponse(u.getId(), u.getCardCode(), u.getScanTime()))));
    }
}