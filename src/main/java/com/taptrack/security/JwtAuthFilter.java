package com.taptrack.security;

import com.taptrack.enums.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwt;

    /** Bỏ qua cho public path: login + card-scan (đã qua DeviceApiKeyFilter). */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        String uri = req.getRequestURI();
        return uri.equals("/api/v1/auth/login")
                || uri.equals("/api/v1/attendance/card-scan");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Jws<Claims> jws = jwt.parse(header.substring(7));
                Claims c = jws.getPayload();
                var principal = new UserPrincipal(
                        Long.valueOf(c.getSubject()),
                        c.get("email", String.class),
                        Role.valueOf(c.get("role", String.class)));
                var auth = new UsernamePasswordAuthenticationToken(
                        principal, null, principal.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception ex) {
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(req, res);
    }
}