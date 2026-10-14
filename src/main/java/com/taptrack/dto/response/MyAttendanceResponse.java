package com.taptrack.dto.response;
import com.taptrack.enums.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record MyAttendanceResponse(
        Long id, LocalDate workDate,
        LocalDateTime checkInTime, LocalDateTime checkOutTime,
        CheckInStatus checkInStatus, CheckOutStatus checkOutStatus,
        Integer lateMinutes, Integer earlyLeaveMinutes,
        boolean isManualEdit) {}