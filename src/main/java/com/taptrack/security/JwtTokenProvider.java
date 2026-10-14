package com.taptrack.security;

import com.taptrack.enums.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long ttlMillis;

    public JwtTokenProvider(@Value("${app.jwt.secret}") String secret,
                            @Value("${app.jwt.access-token-ttl-seconds:28800}") long ttlSeconds) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT secret phải dài ít nhất 32 byte (HS256)");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.ttlMillis = ttlSeconds * 1000L;
    }

    public String generate(Long accountId, String email, Role role) {
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(accountId))
                .claim("email", email)
                .claim("role", role.name())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + ttlMillis))
                .signWith(key)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
    }

    public long getTtlSeconds() { return ttlMillis / 1000L; }
}