import apiClient from '../../../services/apiClient';
import type { ApiResponse } from '../../../types/api';
import type {
    ShiftTemplateRequest,
    ShiftTemplateResponse,
    ShiftAssignmentRequest,
    ShiftAssignmentResponse,
    WeeklyScheduleResponse,
} from '../../../types/shift';

export const shiftApi = {
    // --- Shift Templates ---
    listTemplates: async (): Promise<ShiftTemplateResponse[]> => {
        const res = await apiClient.get<ApiResponse<ShiftTemplateResponse[]>>('/admin/shift-templates');
        return res.data.data;
    },

    createTemplate: async (payload: ShiftTemplateRequest): Promise<ShiftTemplateResponse> => {
        const res = await apiClient.post<ApiResponse<ShiftTemplateResponse>>('/admin/shift-templates', payload);
        return res.data.data;
    },

    deleteTemplate: async (id: number): Promise<void> => {
        await apiClient.delete<ApiResponse<void>>(`/admin/shift-templates/${id}`);
    },

    // --- Shift Assignments ---
    createAssignment: async (payload: ShiftAssignmentRequest): Promise<ShiftAssignmentResponse> => {
        const res = await apiClient.post<ApiResponse<ShiftAssignmentResponse>>('/admin/shift-assignments', payload);
        return res.data.data;
    },

    deleteAssignment: async (id: number): Promise<void> => {
        await apiClient.delete<ApiResponse<void>>(`/admin/shift-assignments/${id}`);
    },

    // Lấy lịch tuần của nhân viên từ EmployeeController
    getEmployeeWeeklySchedule: async (employeeId: number, weekStart: string): Promise<WeeklyScheduleResponse> => {
        const res = await apiClient.get<ApiResponse<WeeklyScheduleResponse>>(
            `/admin/employees/${employeeId}/schedule/week`,
            {
                params: { weekStart },
            }
        );
        return res.data.data;
    },
};