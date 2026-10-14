package com.taptrack.dto.response;

public record DashboardTodayResponse(
        long checkedInCount, long totalAssignedCount,
        long lateCount, long absentCount) {}