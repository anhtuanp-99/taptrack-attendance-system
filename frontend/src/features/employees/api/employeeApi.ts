import apiClient from '../../../services/apiClient';
import type { ApiResponse } from '../../../types/api';
import type { PageResponse } from '../../../types/dashboard';
import type {
    EmployeeResponse,
    DepartmentResponse,
    AccountCreateRequest,
    EmployeeUpdateRequest
} from '../../../types/employee';

export const employeeApi = {
    // Lấy danh sách nhân viên có phân trang & lọc
    getEmployees: async (params: {
        departmentId?: number;
        employmentStatus?: string;
        page?: number;
        size?: number;
    }): Promise<PageResponse<EmployeeResponse>> => {
        const res = await apiClient.get<ApiResponse<PageResponse<EmployeeResponse>>>('/admin/employees', {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 20,
                ...(params.departmentId ? { departmentId: params.departmentId } : {}),
                ...(params.employmentStatus ? { employmentStatus: params.employmentStatus } : {}),
            },
        });
        return res.data.data;
    },

    // Tạo tài khoản và hồ sơ nhân viên
    createEmployee: async (payload: AccountCreateRequest): Promise<void> => {
        await apiClient.post<ApiResponse<unknown>>('/admin/accounts', payload);
    },

    // Cập nhật thông tin nhân viên & mã thẻ RFID
    updateEmployee: async (id: number, payload: EmployeeUpdateRequest): Promise<EmployeeResponse> => {
        const res = await apiClient.put<ApiResponse<EmployeeResponse>>(`/admin/employees/${id}`, payload);
        return res.data.data;
    },

    // Lấy danh sách phòng ban đổ vào dropdown
    getDepartments: async (): Promise<DepartmentResponse[]> => {
        const res = await apiClient.get<ApiResponse<DepartmentResponse[]>>('/admin/departments');
        return res.data.data;
    },
};