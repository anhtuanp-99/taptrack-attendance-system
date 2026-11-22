import type { CheckInStatus, CheckOutStatus } from './dashboard';

export interface MyAttendanceResponse {
    id: number;
    workDate: string; // YYYY-MM-DD
    checkInTime: string | null; // ISO LocalDateTime
    checkOutTime: string | null;
    checkInStatus: CheckInStatus;
    checkOutStatus: CheckOutStatus;
    lateMinutes: number | null;
    earlyLeaveMinutes: number | null;
    isManualEdit: boolean;
}

export interface AdminAttendanceResponse extends MyAttendanceResponse {
    employeeId: number;
    employeeCode: string;
    employeeName: string;
    departmentName: string;
    editedAt: string | null;
    editReason: string | null;
}

export interface AttendanceManualEditRequest {
    employeeId: number;
    workDate: string; // YYYY-MM-DD
    checkInTime: string | null; // YYYY-MM-DDTHH:mm:ss
    checkOutTime: string | null;
    reason?: string;
}

export interface AttendanceManualEditResponse {
    id: number;
    employeeId: number;
    workDate: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    isManualEdit: boolean;
    editReason: string | null;
}

export interface MonthlyReportResponse {
    employeeId: number;
    employeeName: string;
    departmentName: string;
    onTimeDays: number;
    lateDays: number;
    earlyLeaveDays: number;
    absentDays: number;
    missingCheckOutDays: number;
}