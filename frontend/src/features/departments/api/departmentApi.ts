import apiClient from '../../../services/apiClient';
import type { ApiResponse } from '../../../types/api';
import type { DepartmentResponse } from '../../../types/employee';

export interface DepartmentRequest {
    name: string;
}

export const departmentApi = {
    list: async (): Promise<DepartmentResponse[]> => {
        const res = await apiClient.get<ApiResponse<DepartmentResponse[]>>('/admin/departments');
        return res.data.data;
    },

    create: async (payload: DepartmentRequest): Promise<DepartmentResponse> => {
        const res = await apiClient.post<ApiResponse<DepartmentResponse>>('/admin/departments', payload);
        return res.data.data;
    },

    update: async (id: number, payload: DepartmentRequest): Promise<DepartmentResponse> => {
        const res = await apiClient.put<ApiResponse<DepartmentResponse>>(`/admin/departments/${id}`, payload);
        return res.data.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete<ApiResponse<void>>(`/admin/departments/${id}`);
    },
};