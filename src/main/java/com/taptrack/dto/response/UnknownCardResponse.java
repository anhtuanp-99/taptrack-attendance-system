package com.taptrack.dto.response;
import java.time.LocalDateTime;

public record UnknownCardResponse(Long id, String cardCode, LocalDateTime scanTime) {}