import apiClient from '../../../services/apiClient';
import type { ApiResponse } from '../../../types/api';
import type { PageResponse } from '../../../types/dashboard';
import type { MyAttendanceResponse } from '../../../types/attendance';
import type { WeeklyScheduleResponse } from '../../../types/shift';
import type { EmployeeResponse } from '../../../types/employee';

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export const portalApi = {
    getMyProfile: async (): Promise<EmployeeResponse> => {
        const res = await apiClient.get<ApiResponse<EmployeeResponse>>('/employee/me');
        return res.data.data;
    },

    getMyAttendance: async (params: {
        from: string;
        to: string;
        page?: number;
        size?: number;
    }): Promise<PageResponse<MyAttendanceResponse>> => {
        const res = await apiClient.get<ApiResponse<PageResponse<MyAttendanceResponse>>>(
            '/employee/my-attendance',
            {
                params: {
                    from: params.from,
                    to: params.to,
                    page: params.page ?? 0,
                    size: params.size ?? 20,
                },
            }
        );
        return res.data.data;
    },

    getMyWeeklySchedule: async (weekStart: string): Promise<WeeklyScheduleResponse> => {
        const res = await apiClient.get<ApiResponse<WeeklyScheduleResponse>>(
            '/employee/my-schedule/week',
            {
                params: { weekStart },
            }
        );
        return res.data.data;
    },

    changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
        await apiClient.post<ApiResponse<void>>('/auth/change-password', payload);
    },
};