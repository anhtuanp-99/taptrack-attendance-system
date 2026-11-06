import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    Radio,
    Users,
    Building2,
    CalendarRange,
    Clock,
    LogOut,
    Fingerprint
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

const navGroups = [
    {
        title: 'Giám sát',
        items: [
            { path: '/admin/dashboard', label: 'Realtime Live Feed', icon: Radio },
        ],
    },
    {
        title: 'Quản trị hệ thống',
        items: [
            { path: '/admin/employees', label: 'Nhân viên', icon: Users },
            { path: '/admin/departments', label: 'Phòng ban', icon: Building2 },
            { path: '/admin/shifts', label: 'Ca làm việc & Lịch', icon: CalendarRange },
        ],
    },
    {
        title: 'Dữ liệu chấm công',
        items: [
            { path: '/admin/attendance', label: 'Lịch sử chấm công', icon: Clock },
        ],
    },
];

export const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans">
            <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-sm">
                        <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold text-base text-slate-900 leading-tight">TapTrack</div>
                        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">IoT Attendance</div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-5 space-y-6 overflow-y-auto">
                    {navGroups.map((group) => (
                        <div key={group.title}>
                            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                                {group.title}
                            </div>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                                                    isActive
                                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold'
                                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                                }`
                                            }
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            <span>{item.label}</span>
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition duration-150"
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Admin</span>
                        <span>/</span>
                        <span className="font-medium text-slate-800">Quản lý</span>
                    </div>

                    <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Máy chủ sẵn sàng
            </span>
                    </div>
                </header>

                <div className="p-8 max-w-7xl w-full mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Modal xác nhận đăng xuất cho Admin */}
            <ConfirmModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                title="Đăng xuất khỏi hệ thống?"
                message="Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị TapTrack không?"
                confirmText="Đăng xuất"
                variant="warning"
            />
        </div>
    );
};