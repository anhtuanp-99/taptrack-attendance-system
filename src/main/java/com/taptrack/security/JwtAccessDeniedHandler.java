package com.taptrack.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taptrack.dto.response.ApiResponse;
import com.taptrack.exception.ErrorCode;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {
    private final ObjectMapper mapper;

    @Override
    public void handle(HttpServletRequest req, HttpServletResponse res,
                       AccessDeniedException ex) throws IOException {
        res.setStatus(ErrorCode.ACCESS_DENIED.getStatus().value());
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write(mapper.writeValueAsString(
                ApiResponse.fail(ErrorCode.ACCESS_DENIED.name(),
                        ErrorCode.ACCESS_DENIED.getMessage(), null)));
    }
}