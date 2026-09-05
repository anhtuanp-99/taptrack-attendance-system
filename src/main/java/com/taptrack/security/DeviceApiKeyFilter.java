package com.taptrack.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class DeviceApiKeyFilter extends OncePerRequestFilter {

    @Value("${taptrack.device.api-key}")
    private String expectedApiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        // Chỉ áp dụng lọc API Key đối với endpoint dành riêng cho thiết bị ESP32 quẹt thẻ
        if (requestURI.startsWith("/api/attendance/card-scan")) {
            String apiKeyHeader = request.getHeader("X-Device-API-Key");

            if (apiKeyHeader == null || !apiKeyHeader.equals(expectedApiKey)) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"success\": false, \"message\": \"Device API Key không hợp lệ hoặc bị thiếu\", \"errorCode\": \"INVALID_DEVICE_KEY\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}