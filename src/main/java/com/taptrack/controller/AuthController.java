package com.taptrack.controller;

import com.taptrack.dto.request.*;
import com.taptrack.dto.response.*;
import com.taptrack.security.UserPrincipal;
import com.taptrack.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponse.ok(authService.login(req));
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@AuthenticationPrincipal UserPrincipal p,
                                            @Valid @RequestBody ChangePasswordRequest req) {
        authService.changePassword(p.getId(), req);
        return ApiResponse.ok();
    }
}