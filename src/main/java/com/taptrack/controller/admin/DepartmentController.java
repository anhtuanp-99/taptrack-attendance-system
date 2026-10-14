package com.taptrack.controller.admin;

import com.taptrack.dto.request.DepartmentRequest;
import com.taptrack.dto.response.*;
import com.taptrack.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService service;

    @PostMapping
    public ApiResponse<DepartmentResponse> create(@Valid @RequestBody DepartmentRequest req) {
        return ApiResponse.ok(service.create(req));
    }

    @GetMapping
    public ApiResponse<List<DepartmentResponse>> list() {
        return ApiResponse.ok(service.list());
    }

    @PutMapping("/{id}")
    public ApiResponse<DepartmentResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody DepartmentRequest req) {
        return ApiResponse.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.ok();
    }
}