package com.taptrack.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taptrack.dto.response.ApiResponse;
import com.taptrack.exception.ErrorCode;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private final ObjectMapper mapper;

    @Override
    public void commence(HttpServletRequest req, HttpServletResponse res,
                         AuthenticationException ex) throws IOException {
        res.setStatus(ErrorCode.UNAUTHENTICATED.getStatus().value());
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write(mapper.writeValueAsString(
                ApiResponse.fail(ErrorCode.UNAUTHENTICATED.name(),
                        ErrorCode.UNAUTHENTICATED.getMessage(), null)));
    }
}