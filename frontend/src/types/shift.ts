export interface ShiftTemplateRequest {
    name: string;
    startTime: string; // HH:mm:ss
    endTime: string;   // HH:mm:ss
}

export interface ShiftTemplateResponse {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
}

export interface ShiftAssignmentRequest {
    employeeId: number;
    shiftTemplateId: number;
    workDate: string; // YYYY-MM-DD
}

export interface ShiftAssignmentResponse {
    id: number;
    employeeId: number;
    shiftTemplateId: number;
    workDate: string;
}

export type DayScheduleStatus = 'SHIFT' | 'OFF';

export interface DayScheduleItem {
    date: string; // YYYY-MM-DD
    status: DayScheduleStatus;
    shiftName: string | null;
    startTime: string | null;
    endTime: string | null;
}

export interface WeeklyScheduleResponse {
    weekStart: string;
    days: DayScheduleItem[];
}