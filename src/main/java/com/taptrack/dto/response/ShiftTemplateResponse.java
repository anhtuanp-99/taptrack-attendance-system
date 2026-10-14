package com.taptrack.dto.response;
import java.time.LocalTime;

public record ShiftTemplateResponse(Long id, String name, LocalTime startTime, LocalTime endTime) {}