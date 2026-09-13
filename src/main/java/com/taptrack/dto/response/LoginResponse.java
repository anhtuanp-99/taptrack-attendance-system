package com.taptrack.dto.response;

import com.taptrack.enums.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LoginResponse {
    private String accessToken;
    private Role role;
    private String fullName;
    private String email;
}