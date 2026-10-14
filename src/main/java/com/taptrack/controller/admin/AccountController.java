package com.taptrack.controller.admin;

import com.taptrack.dto.request.*;
import com.taptrack.dto.response.*;
import com.taptrack.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService service;

    @PostMapping
    public ApiResponse<AccountResponse> create(@Valid @RequestBody AccountCreateRequest req) {
        return ApiResponse.ok(service.create(req));
    }

    @PostMapping("/{id}/reset-password")
    public ApiResponse<Void> reset(@PathVariable Long id,
                                   @Valid @RequestBody ResetPasswordRequest req) {
        service.resetPassword(id, req);
        return ApiResponse.ok();
    }
}