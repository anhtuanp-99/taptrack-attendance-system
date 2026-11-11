import apiClient from '../../../services/apiClient';
import type { ApiResponse } from '../../../types/api';
import type { DashboardTodayResponse, PageResponse, UnknownCardResponse } from '../../../types/dashboard';

export const dashboardApi = {
    getTodayStats: async (departmentId?: number): Promise<DashboardTodayResponse> => {
        const res = await apiClient.get<ApiResponse<DashboardTodayResponse>>('/admin/dashboard/today', {
            params: departmentId ? { departmentId } : {},
        });
        return res.data.data;
    },

    getRecentUnknownCards: async (size = 5): Promise<UnknownCardResponse[]> => {
        const res = await apiClient.get<ApiResponse<PageResponse<UnknownCardResponse>>>(
            '/admin/attendance/unknown-cards',
            {
                params: { page: 0, size },
            }
        );
        return res.data.data.content;
    },
};