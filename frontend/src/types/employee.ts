export type EmploymentStatus = 'ACTIVE' | 'INACTIVE';

export interface DepartmentResponse {
    id: number;
    name: string;
}

export interface EmployeeProfileRequest {
    employeeCode: string; // Thêm trường này
    departmentId: number;
    cardCode: string;
    jobTitle?: string;
}

export interface AccountCreateRequest {
    email: string;
    fullName: string;
    initialPassword: string;
    role: 'EMPLOYEE' | 'ADMIN';
    employeeProfile: EmployeeProfileRequest;
}

export interface EmployeeUpdateRequest {
    fullName: string;
    departmentId: number;
    jobTitle?: string;
    cardCode: string;
    employmentStatus: EmploymentStatus;
}

export interface EmployeeResponse {
    id: number;
    accountId: number;
    email: string;
    fullName: string;
    departmentId: number;
    departmentName: string;
    employeeCode: string;
    cardCode: string;
    jobTitle: string | null;
    employmentStatus: EmploymentStatus;
}