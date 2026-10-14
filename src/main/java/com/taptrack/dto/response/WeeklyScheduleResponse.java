package com.taptrack.dto.response;
import java.time.LocalDate;
import java.util.List;

public record WeeklyScheduleResponse(LocalDate weekStart, List<DayScheduleItem> days) {}