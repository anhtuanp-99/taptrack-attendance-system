export interface ApiResponse<T> {
    success: boolean;
    message: string;
    errorCode?: string;
    data: T;
}

export type Role = 'ADMIN' | 'EMPLOYEE';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    accessTokenExpiresIn: number;
    role: Role;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}