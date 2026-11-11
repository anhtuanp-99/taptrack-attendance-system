import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, LogOut, Clock } from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const EmployeePortalPage: React.FC = () => {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
            {/* Topbar của Portal Nhân viên */}
            <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sm:px-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-sm">
                        <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold text-base text-slate-900 leading-tight">TapTrack</div>
                        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Cổng nhân viên</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 transition duration-150"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </header>

            {/* Nội dung chính màn hình nhân viên */}
            <main className="flex-1 p-6 sm:p-10 max-w-5xl w-full mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lịch sử Chấm công Cá nhân</h1>
                    <p className="text-sm text-slate-500 mt-1">Theo dõi thời gian vào/ra và các lượt quẹt thẻ của bạn</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-3">
                    <Clock className="w-10 h-10 mx-auto text-indigo-500 opacity-60" />
                    <p className="text-base font-medium text-slate-700">Dữ liệu chấm công đang được đồng bộ</p>
                    <p className="text-xs text-slate-400">Các lượt quẹt thẻ RFID tại trạm đọc sẽ xuất hiện trực tiếp tại đây.</p>
                </div>
            </main>

            {/* Modal xác nhận đăng xuất */}
            <ConfirmModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                title="Đăng xuất khỏi hệ thống?"
                message="Bạn có chắc chắn muốn kết thúc phiên làm việc hiện tại không?"
                confirmText="Đăng xuất"
                variant="warning"
            />
        </div>
    );
};