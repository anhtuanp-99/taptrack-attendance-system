// EmployeeController.java
package com.taptrack.controller.admin;

import com.taptrack.dto.request.AccountCreateRequest;
import com.taptrack.dto.request.EmployeeUpdateRequest;
import com.taptrack.dto.response.ApiResponse;
import com.taptrack.dto.response.EmployeeResponse;
import com.taptrack.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> createAccount(@Valid @RequestBody AccountCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tạo tài khoản/nhân viên thành công", employeeService.createAccountWithEmployee(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin nhân viên thành công", employeeService.updateEmployee(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Xử lý xóa/vô hiệu hóa nhân viên thành công", null));
    }
}