import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Fingerprint,
    LogOut,
    Clock,
    CalendarRange,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    AlertTriangle,
    UserCheck,
    KeyRound,
    RotateCw,
} from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { portalApi } from './api/portalApi';
import type { MyAttendanceResponse } from '../../types/attendance';
import type { WeeklyScheduleResponse } from '../../types/shift';
import type { EmployeeResponse } from '../../types/employee';

const formatDateLocal = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getMondayOfDate = (d: Date): string => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    return formatDateLocal(date);
};

const getFirstDayOfMonth = (): string => {
    const now = new Date();
    return formatDateLocal(new Date(now.getFullYear(), now.getMonth(), 1));
};

const getToday = (): string => formatDateLocal(new Date());

const dayNamesVi = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

export const EmployeePortalPage: React.FC = () => {
    const navigate = useNavigate();

    // Profile State
    const [profile, setProfile] = useState<EmployeeResponse | null>(null);

    // Modals
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showChangePass, setShowChangePass] = useState(false);

    // Weekly Schedule State
    const currentMonday = useMemo(() => getMondayOfDate(new Date()), []);
    const [weekStart, setWeekStart] = useState<string>(currentMonday);
    const [schedule, setSchedule] = useState<WeeklyScheduleResponse | null>(null);
    const [loadingSchedule, setLoadingSchedule] = useState(false);

    // Attendance History State
    const [fromDate, setFromDate] = useState<string>(getFirstDayOfMonth);
    const [toDate, setToDate] = useState<string>(getToday);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [records, setRecords] = useState<MyAttendanceResponse[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Tải thông tin cá nhân
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await portalApi.getMyProfile();
                setProfile(data);
            } catch (err) {
                console.error('Lỗi tải thông tin cá nhân:', err);
            }
        };
        void loadProfile();
    }, []);

    const loadSchedule = useCallback(async () => {
        setLoadingSchedule(true);
        try {
            const res = await portalApi.getMyWeeklySchedule(weekStart);
            setSchedule(res);
        } catch (err) {
            console.error('Lỗi tải lịch làm việc cá nhân:', err);
            setSchedule(null);
        } finally {
            setLoadingSchedule(false);
        }
    }, [weekStart]);

    const loadHistory = useCallback(async () => {
        setLoadingHistory(true);
        try {
            const res = await portalApi.getMyAttendance({
                from: fromDate,
                to: toDate,
                page,
                size: 20,
            });
            setRecords(res.content);
            setTotalPages(res.totalPages);
            setTotalElements(res.totalElements);
        } catch (err) {
            console.error('Lỗi tải lịch sử chấm công cá nhân:', err);
        } finally {
            setLoadingHistory(false);
        }
    }, [fromDate, toDate, page]);

    useEffect(() => {
        void loadSchedule();
    }, [loadSchedule]);

    useEffect(() => {
        void loadHistory();
    }, [loadHistory]);

    const summaryStats = useMemo(() => {
        let onTimeCount = 0;
        let violationCount = 0;
        for (const r of records) {
            if (r.checkInStatus === 'ON_TIME' && r.checkOutStatus === 'ON_TIME') {
                onTimeCount++;
            }
            if (r.checkInStatus === 'LATE' || r.checkOutStatus === 'EARLY_LEAVE') {
                violationCount++;
            }
        }
        return { onTimeCount, violationCount };
    }, [records]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login', { replace: true });
    };

    const handlePrevWeek = () => {
        const cur = new Date(weekStart);
        cur.setDate(cur.getDate() - 7);
        setWeekStart(formatDateLocal(cur));
    };

    const handleNextWeek = () => {
        const cur = new Date(weekStart);
        cur.setDate(cur.getDate() + 7);
        setWeekStart(formatDateLocal(cur));
    };

    const formatTimeShort = (isoString: string | null) => {
        if (!isoString) return '--:--';
        return isoString.includes('T') ? isoString.split('T')[1].slice(0, 5) : isoString.slice(0, 5);
    };

    const todayStr = getToday();
    const isCurrentWeek = weekStart === currentMonday;

    return (
        <div className="min-h-screen bg-slate-50/80 text-slate-800 flex flex-col font-sans">
            {/* Topbar tối giản */}
            <header className="h-16 border-b border-slate-200/80 bg-white flex items-center justify-between px-6 sm:px-10 shrink-0 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-xs">
                        <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold text-base text-slate-900 leading-tight">TapTrack</div>
                        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Cổng Nhân viên</div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setShowChangePass(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition"
                    >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Đổi mật khẩu</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 sm:p-10 max-w-6xl w-full mx-auto space-y-8">
                {/* 1. BANNER CHÀO MỪNG TINH GỌN */}
                {profile && (
                    <section className="bg-white rounded-2xl border border-slate-200/80 px-6 py-5 shadow-2xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                            {profile.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                                Xin chào, {profile.fullName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 mt-1">
                                <span className="font-mono font-semibold text-indigo-600">{profile.employeeCode}</span>
                                <span className="text-slate-300">•</span>
                                <span className="font-medium text-slate-700">{profile.departmentName}</span>
                                {profile.jobTitle && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <span>{profile.jobTitle}</span>
                                    </>
                                )}
                                <span className="text-slate-300">•</span>
                                <span className="font-mono text-slate-500">Thẻ RFID: {profile.cardCode}</span>
                            </div>
                        </div>
                    </section>
                )}

                {/* 2. LỊCH LÀM VIỆC TUẦN */}
                <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                                <CalendarRange className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-slate-900">Lịch Làm Việc Tuần</h2>
                                <p className="text-xs text-slate-500">Phân công ca làm việc từ Thứ 2 đến Chủ nhật</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {!isCurrentWeek && (
                                <button
                                    type="button"
                                    onClick={() => setWeekStart(currentMonday)}
                                    className="px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition"
                                >
                                    Tuần này
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handlePrevWeek}
                                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition"
                                title="Tuần trước"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl font-mono">
                                Tuần {weekStart}
                            </div>
                            <button
                                type="button"
                                onClick={handleNextWeek}
                                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition"
                                title="Tuần sau"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => void loadSchedule()}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                                title="Tải lại lịch"
                            >
                                <RotateCw className={`w-4 h-4 ${loadingSchedule ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                        {dayNamesVi.map((dayName, idx) => {
                            const item = schedule?.days?.[idx];
                            const dateStr = item?.date || '';
                            const isAssigned = item?.status === 'SHIFT';
                            const isToday = dateStr === todayStr;

                            return (
                                <div
                                    key={dayName}
                                    className={`rounded-2xl p-4 flex flex-col justify-between min-h-[126px] transition ${
                                        isAssigned
                                            ? 'bg-white border border-indigo-200 border-l-4 border-l-indigo-600 shadow-xs'
                                            : isToday
                                                ? 'bg-indigo-50/30 border border-dashed border-indigo-300'
                                                : 'bg-transparent border border-dashed border-slate-200/90'
                                    }`}
                                >
                                    <div>
                                        {/* Hàng 1: Thứ & Ngày luôn nằm gọn 1 dòng */}
                                        <div className="flex items-center justify-between gap-1 whitespace-nowrap">
                      <span
                          className={`text-xs font-bold uppercase ${
                              isAssigned || isToday ? 'text-slate-800' : 'text-slate-400'
                          }`}
                      >
                        {dayName}
                      </span>
                                            <span className="text-[11px] font-mono text-slate-400">{dateStr.slice(5)}</span>
                                        </div>

                                        {/* Hàng 2: Nhãn Hôm nay tách riêng để không bẻ chữ */}
                                        {isToday && (
                                            <div className="mt-1.5">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-600 text-white whitespace-nowrap">
                          Hôm nay
                        </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3">
                                        {isAssigned ? (
                                            <div className="space-y-1">
                                                <div className="text-sm font-bold text-indigo-950 truncate">{item.shiftName}</div>
                                                <div className="inline-flex items-center gap-1 text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                                    <Clock className="w-3 h-3" />
                                                    <span>
                            {item.startTime?.slice(0, 5)} - {item.endTime?.slice(0, 5)}
                          </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-1.5 text-xs text-slate-400">Ngày nghỉ</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 3. LỊCH SỬ CHẤM CÔNG CÁ NHÂN */}
                <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-slate-900">Lịch Sử Chấm Công</h2>
                                <p className="text-xs text-slate-500">Chi tiết các ngày phát sinh dữ liệu quẹt thẻ</p>
                            </div>
                        </div>

                        {/* Bộ lọc ngày */}
                        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase pl-1.5">Từ</span>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => {
                                        setFromDate(e.target.value);
                                        setPage(0);
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase">Đến</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => {
                                        setToDate(e.target.value);
                                        setPage(0);
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => void loadHistory()}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                                title="Làm mới"
                            >
                                <RotateCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* 3 Thẻ KPI ngắn gọn */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="bg-white px-5 py-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">Ngày có công</span>
                            <span className="text-lg font-bold font-mono text-slate-900">{totalElements} ngày</span>
                        </div>
                        <div className="bg-white px-5 py-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">Đúng giờ trọn ca</span>
                            <span className="text-lg font-bold font-mono text-emerald-600">{summaryStats.onTimeCount} buổi</span>
                        </div>
                        <div className="bg-white px-5 py-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">Đi muộn / Về sớm</span>
                            <span className="text-lg font-bold font-mono text-rose-600">{summaryStats.violationCount} buổi</span>
                        </div>
                    </div>

                    {/* Bảng chi tiết */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100 font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Ngày làm việc</th>
                                    <th className="px-6 py-3.5">Giờ vào</th>
                                    <th className="px-6 py-3.5">Giờ ra</th>
                                    <th className="px-6 py-3.5">Trạng thái vào</th>
                                    <th className="px-6 py-3.5">Trạng thái ra</th>
                                    <th className="px-6 py-3.5">Ghi chú</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {loadingHistory ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                            Đang tải dữ liệu chấm công...
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                            Chưa có lượt quẹt thẻ nào trong khoảng thời gian đã chọn
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((rec) => (
                                        <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                                            <td className="px-6 py-3.5 whitespace-nowrap font-mono text-xs font-semibold text-slate-800">
                                                {rec.workDate}
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap font-mono text-xs font-medium text-slate-700">
                                                {formatTimeShort(rec.checkInTime)}
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap font-mono text-xs font-medium text-slate-700">
                                                {formatTimeShort(rec.checkOutTime)}
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                {rec.checkInStatus === 'LATE' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80">
                              <AlertTriangle className="w-3 h-3" />
                              Muộn {rec.lateMinutes ? `${rec.lateMinutes}p` : ''}
                            </span>
                                                ) : rec.checkInStatus === 'ON_TIME' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              <CheckCircle2 className="w-3 h-3" /> Đúng giờ
                            </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">--</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                {rec.checkOutStatus === 'EARLY_LEAVE' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                              <AlertTriangle className="w-3 h-3" />
                              Về sớm {rec.earlyLeaveMinutes ? `${rec.earlyLeaveMinutes}p` : ''}
                            </span>
                                                ) : rec.checkOutStatus === 'ON_TIME' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              <CheckCircle2 className="w-3 h-3" /> Đúng giờ
                            </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Chưa ra ca</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                {rec.isManualEdit ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                              <UserCheck className="w-3 h-3" /> Admin điều chỉnh
                            </span>
                                                ) : (
                                                    <span className="text-xs text-slate-300">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Trang <strong>{page + 1}</strong> / {totalPages}
                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={page === 0}
                                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
                                    >
                                        Trang trước
                                    </button>
                                    <button
                                        type="button"
                                        disabled={page + 1 >= totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
                                    >
                                        Trang sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Modal Đổi mật khẩu */}
            <ChangePasswordModal
                isOpen={showChangePass}
                onClose={() => setShowChangePass(false)}
            />

            {/* Modal Xác nhận đăng xuất */}
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