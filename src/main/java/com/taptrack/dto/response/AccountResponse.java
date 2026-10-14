package com.taptrack.dto.response;
import com.taptrack.enums.Role;

public record AccountResponse(Long id, String email, String fullName, Role role) {}