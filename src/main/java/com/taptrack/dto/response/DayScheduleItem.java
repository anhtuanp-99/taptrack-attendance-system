package com.taptrack.dto.response;
import com.taptrack.enums.DayScheduleStatus;
import java.time.LocalDate;
import java.time.LocalTime;

public record DayScheduleItem(
        LocalDate date, DayScheduleStatus status,
        String shiftName, LocalTime startTime, LocalTime endTime) {}