package com.taptrack.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taptrack.dto.response.CardScanResponse;
import com.taptrack.enums.LedCommand;
import com.taptrack.exception.ErrorCode;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;

/**
 * Chỉ chạy cho path card-scan; so sánh key theo constant-time.
 * Trả về CardScanResponse phẳng đồng bộ với thiết bị ESP32.
 */
@Component
@RequiredArgsConstructor
public class DeviceApiKeyFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;

    @Value("${app.device.api-key}")
    private String expectedKey;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        return !req.getRequestURI().equals("/api/v1/attendance/card-scan");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        String provided = req.getHeader("X-Device-API-Key");
        if (!constantTimeEquals(provided, expectedKey)) {
            res.setStatus(ErrorCode.DEVICE_KEY_INVALID.getStatus().value());
            res.setContentType("application/json;charset=UTF-8");

            LocalDateTime now = LocalDateTime.now();
            CardScanResponse body = new CardScanResponse(
                    now,
                    null,
                    null,
                    null,
                    null,
                    null,
                    LedCommand.RED,
                    "KEY KHONG HOP LE\nTHU LAI"
            );
            res.getWriter().write(objectMapper.writeValueAsString(body));
            return;
        }
        chain.doFilter(req, res);
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8),
                b.getBytes(StandardCharsets.UTF_8));
    }
}