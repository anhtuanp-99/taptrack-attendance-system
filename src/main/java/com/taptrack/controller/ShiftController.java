// ShiftController.java
package com.taptrack.controller.admin;

import com.taptrack.dto.request.ShiftAssignmentRequest;
import com.taptrack.dto.request.ShiftTemplateRequest;
import com.taptrack.dto.response.ApiResponse;
import com.taptrack.entity.ShiftAssignment;
import com.taptrack.entity.ShiftTemplate;
import com.taptrack.service.ShiftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/shifts")
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;

    @PostMapping("/templates")
    public ResponseEntity<ApiResponse<ShiftTemplate>> createTemplate(@Valid @RequestBody ShiftTemplateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tạo mẫu ca thành công", shiftService.createTemplate(request)));
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(@PathVariable Long id) {
        shiftService.deleteTemplate(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa mẫu ca thành công", null));
    }

    @PostMapping("/assignments")
    public ResponseEntity<ApiResponse<ShiftAssignment>> assignShift(@Valid @RequestBody ShiftAssignmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Phân ca làm việc thành công", shiftService.assignShift(request)));
    }
}