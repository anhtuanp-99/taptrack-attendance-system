package com.taptrack.dto.response;
import com.taptrack.enums.Role;
public record LoginResponse(String accessToken, long accessTokenExpiresIn, Role role) {}