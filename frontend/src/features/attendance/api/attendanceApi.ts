import apiClient from '../../../services/apiClient';
import type { ApiResponse } from '../../../types/api';
import type { PageResponse } from '../../../types/dashboard';
import type {
    AdminAttendanceResponse,
    AttendanceManualEditRequest,
    AttendanceManualEditResponse,
    MonthlyReportResponse,
} from '../../../types/attendance';

export const attendanceApi = {
    getHistory: async (params: {
        from: string;
        to: string;
        employeeId?: number;
        departmentId?: number;
        page?: number;
        size?: number;
    }): Promise<PageResponse<AdminAttendanceResponse>> => {
        const res = await apiClient.get<ApiResponse<PageResponse<AdminAttendanceResponse>>>(
            '/admin/attendance',
            {
                params: {
                    from: params.from,
                    to: params.to,
                    page: params.page ?? 0,
                    size: params.size ?? 30,
                    ...(params.employeeId ? { employeeId: params.employeeId } : {}),
                    ...(params.departmentId ? { departmentId: params.departmentId } : {}),
                },
            }
        );
        return res.data.data;
    },

    manualEdit: async (
        payload: AttendanceManualEditRequest
    ): Promise<AttendanceManualEditResponse> => {
        const res = await apiClient.post<ApiResponse<AttendanceManualEditResponse>>(
            '/admin/attendance/manual-edit',
            payload
        );
        return res.data.data;
    },

    getMonthlyReport: async (params: {
        year: number;
        month: number;
        departmentId?: number;
    }): Promise<MonthlyReportResponse[]> => {
        const res = await apiClient.get<ApiResponse<MonthlyReportResponse[]>>(
            '/admin/reports/monthly',
            {
                params: {
                    year: params.year,
                    month: params.month,
                    ...(params.departmentId ? { departmentId: params.departmentId } : {}),
                },
            }
        );
        return res.data.data;
    },
};