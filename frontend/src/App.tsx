import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { EmployeeListPage } from './features/employees/EmployeeListPage';
import { EmployeePortalPage } from './features/portal/EmployeePortalPage';

// Guard bảo vệ Route: Kiểm tra đăng nhập và phân quyền theo Role
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: string }> = ({
                                                                                           children,
                                                                                           allowedRole,
                                                                                       }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && role !== allowedRole) {
        return <Navigate to={role === 'ADMIN' ? '/admin/dashboard' : '/portal/my-attendance'} replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Trang xác thực */}
                <Route path="/login" element={<LoginPage />} />

                {/* Khu vực Quản trị Admin */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Mặc định vào /admin sẽ chuyển tiếp sang /admin/dashboard */}
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />

                    {/* Các route quản trị chức năng sẽ làm tiếp ở Giai đoạn 3 */}
                    <Route path="employees" element={<EmployeeListPage />} />
                    <Route path="departments" element={<div className="p-4 text-slate-500">Chức năng Quản lý Phòng ban đang hoàn thiện</div>} />
                    <Route path="shifts" element={<div className="p-4 text-slate-500">Chức năng Quản lý Ca làm việc đang hoàn thiện</div>} />
                    <Route path="attendance" element={<div className="p-4 text-slate-500">Chức năng Lịch sử Chấm công đang hoàn thiện</div>} />
                </Route>

                {/* Khu vực Cổng thông tin Nhân viên */}
                <Route
                    path="/portal/my-attendance"
                    element={
                        <ProtectedRoute allowedRole="EMPLOYEE">
                            <EmployeePortalPage />
                        </ProtectedRoute>
                    }
                />

                {/* Mọi route không khớp đều chuyển hướng về /login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;