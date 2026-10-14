package com.taptrack.controller.admin;

import com.taptrack.dto.request.*;
import com.taptrack.dto.response.*;
import com.taptrack.service.ShiftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService service;

    // Template
    @PostMapping("/shift-templates")
    public ApiResponse<ShiftTemplateResponse> createTemplate(
            @Valid @RequestBody ShiftTemplateRequest req) {
        return ApiResponse.ok(service.createTemplate(req));
    }

    @GetMapping("/shift-templates")
    public ApiResponse<List<ShiftTemplateResponse>> listTemplates() {
        return ApiResponse.ok(service.listTemplates());
    }

    @DeleteMapping("/shift-templates/{id}")
    public ApiResponse<Void> deleteTemplate(@PathVariable Long id) {
        service.deleteTemplate(id);
        return ApiResponse.ok();
    }

    // Assignment
    @PostMapping("/shift-assignments")
    public ApiResponse<ShiftAssignmentResponse> createAssignment(
            @Valid @RequestBody ShiftAssignmentRequest req) {
        return ApiResponse.ok(service.createAssignment(req));
    }

    @PutMapping("/shift-assignments/{id}")
    public ApiResponse<ShiftAssignmentResponse> updateAssignment(
            @PathVariable Long id, @Valid @RequestBody ShiftAssignmentRequest req) {
        return ApiResponse.ok(service.updateAssignment(id, req));
    }

    @DeleteMapping("/shift-assignments/{id}")
    public ApiResponse<Void> deleteAssignment(@PathVariable Long id) {
        service.deleteAssignment(id);
        return ApiResponse.ok();
    }
}