package com.taptrack.dto.response;

import com.taptrack.enums.Role;

public record AccountResponse(
        Long id,          // Đây là Account ID
        Long employeeId,  // MỚI: Đây là Employee ID (null nếu là ADMIN)
        String email,
        String fullName,
        Role role) {}