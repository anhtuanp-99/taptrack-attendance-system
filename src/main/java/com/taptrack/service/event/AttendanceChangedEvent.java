package com.taptrack.service.event;

import com.taptrack.dto.response.AttendanceWebSocketMessage;

public record AttendanceChangedEvent(AttendanceWebSocketMessage message) {}