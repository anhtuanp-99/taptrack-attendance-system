package com.taptrack.mapper;

import com.taptrack.dto.response.*;
import com.taptrack.entity.AttendanceRecord;
import org.springframework.stereotype.Component;

@Component
public class AttendanceMapper {

    public MyAttendanceResponse toMyAttendance(AttendanceRecord r) {
        return new MyAttendanceResponse(
                r.getId(), r.getWorkDate(),
                r.getCheckInTime(), r.getCheckOutTime(),
                r.getCheckInStatus(), r.getCheckOutStatus(),
                r.getLateMinutes(), r.getEarlyLeaveMinutes(),
                r.isManualEdit());
    }

    public AttendanceWebSocketMessage toWsMessage(AttendanceRecord r, String type) {
        return new AttendanceWebSocketMessage(
                type,
                r.getEmployee().getId(),
                r.getEmployee().getAccount().getFullName(),
                r.getEmployee().getDepartment().getId(),
                r.getEmployee().getDepartment().getName(),
                r.getWorkDate(),
                r.getCheckInTime(), r.getCheckOutTime(),
                r.getCheckInStatus(), r.getCheckOutStatus());
    }
}