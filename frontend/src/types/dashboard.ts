export type CheckInStatus = 'ON_TIME' | 'LATE' | null;
export type CheckOutStatus = 'ON_TIME' | 'EARLY_LEAVE' | null;

export interface DashboardTodayResponse {
    checkedInCount: number;
    totalAssignedCount: number;
    lateCount: number;
    absentCount: number;
}

export interface AttendanceWebSocketMessage {
    type: string;
    employeeId: number;
    employeeName: string;
    departmentId: number;
    departmentName: string;
    workDate: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    checkInStatus: CheckInStatus;
    checkOutStatus: CheckOutStatus;
}

export interface UnknownCardResponse {
    id: number;
    cardCode: string;
    scanTime: string;
}

export interface PageResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}