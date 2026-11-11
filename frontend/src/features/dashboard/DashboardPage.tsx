import React, { useEffect, useState, useCallback } from 'react';
import {
    Users,
    UserCheck,
    ClockAlert,
    UserX,
    Radio,
    ArrowUpRight,
    ArrowDownLeft,
    CheckCircle2,
    AlertTriangle,
    CreditCard,
    RotateCw,
    Copy,
    Check
} from 'lucide-react';
import { dashboardApi } from './api/dashboardApi';
import { useAttendanceWs } from './hooks/useAttendanceWs';
import type { DashboardTodayResponse, AttendanceWebSocketMessage, UnknownCardResponse } from '../../types/dashboard';

export const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardTodayResponse>({
        checkedInCount: 0,
        totalAssignedCount: 0,
        lateCount: 0,
        absentCount: 0,
    });
    const [feed, setFeed] = useState<AttendanceWebSocketMessage[]>([]);
    const [unknownCards, setUnknownCards] = useState<UnknownCardResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshingCards, setRefreshingCards] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // 1. Tải dữ liệu ban đầu
    const loadData = useCallback(async () => {
        try {
            const [todayStats, recentCards] = await Promise.all([
                dashboardApi.getTodayStats(),
                dashboardApi.getRecentUnknownCards(6),
            ]);
            setStats(todayStats);
            setUnknownCards(recentCards);
        } catch (err) {
            console.error('Lỗi tải dữ liệu Dashboard:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Làm mới riêng danh sách thẻ lạ
    const refreshUnknownCards = async () => {
        setRefreshingCards(true);
        try {
            const cards = await dashboardApi.getRecentUnknownCards(6);
            setUnknownCards(cards);
        } catch (err) {
            console.error('Lỗi làm mới thẻ lạ:', err);
        } finally {
            setRefreshingCards(false);
        }
    };

    // 2. Nhận tin nhắn điểm danh hợp lệ
    const handleAttendance = useCallback((msg: AttendanceWebSocketMessage) => {
        setFeed((prev) => [msg, ...prev.slice(0, 29)]);
        setStats((prev) => {
            const isCheckIn = msg.checkInTime && !msg.checkOutTime;
            const isLate = msg.checkInStatus === 'LATE';
            return {
                ...prev,
                checkedInCount: isCheckIn ? prev.checkedInCount + 1 : prev.checkedInCount,
                lateCount: isLate ? prev.lateCount + 1 : prev.lateCount,
                absentCount: isCheckIn && prev.absentCount > 0 ? prev.absentCount - 1 : prev.absentCount,
            };
        });
    }, []);

    // 3. Nhận tin nhắn thẻ lạ từ WebSocket
    const handleUnknownCard = useCallback((card: UnknownCardResponse) => {
        setUnknownCards((prev) => [card, ...prev.filter((c) => c.id !== card.id).slice(0, 5)]);
    }, []);

    const { isConnected } = useAttendanceWs({
        onAttendance: handleAttendance,
        onUnknownCard: handleUnknownCard,
    });

    const formatTime = (isoString: string | null) => {
        if (!isoString) return '--:--';
        const date = new Date(isoString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(text);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Giám sát Điểm danh Hôm nay</h1>
                    <p className="text-sm text-slate-500 mt-1">Dữ liệu quẹt thẻ tức thời từ trạm đọc RFID</p>
                </div>

                {/* WebSocket Connection Status */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white shadow-sm">
                    <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
                    <span className="text-slate-600">STOMP:</span>
                    {isConnected ? (
                        <span className="text-emerald-600 font-semibold">Đang nhận dữ liệu</span>
                    ) : (
                        <span className="text-slate-400">Đang kết nối lại...</span>
                    )}
                </div>
            </div>

            {/* 4 Cards Thống kê Tổng quan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng ca phân công</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : stats.totalAssignedCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Đã vào ca</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : stats.checkedInCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <UserCheck className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Đi muộn</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : stats.lateCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                        <ClockAlert className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Vắng mặt</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : stats.absentCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                        <UserX className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Bố cục 2 Cột: Live Feed (Trái) & Thẻ lạ / Đăng ký thẻ (Phải) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* CỘT TRÁI (2/3): Luồng Điểm Danh Hợp Lệ */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Luồng Quẹt Thẻ Hợp Lệ</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Lượt chấm công được ghi nhận từ thiết bị</p>
                        </div>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-mono">
              {feed.length} sự kiện
            </span>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        {feed.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <Radio className="w-8 h-8 mx-auto mb-3 opacity-30 animate-pulse" />
                                <p className="text-sm font-medium">Chưa có lượt quẹt thẻ nào trong phiên này</p>
                                <p className="text-xs text-slate-400 mt-1">Các lượt chấm công hợp lệ sẽ hiển thị tại đây</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100 font-semibold">
                                <tr>
                                    <th className="px-5 py-3.5">Hành động</th>
                                    <th className="px-5 py-3.5">Nhân viên</th>
                                    <th className="px-5 py-3.5">Phòng ban</th>
                                    <th className="px-5 py-3.5">Thời gian</th>
                                    <th className="px-5 py-3.5">Trạng thái</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {feed.map((item, index) => {
                                    const isCheckOut = Boolean(item.checkOutTime);
                                    const isLate = item.checkInStatus === 'LATE';
                                    const isEarly = item.checkOutStatus === 'EARLY_LEAVE';

                                    return (
                                        <tr key={`${item.employeeId}-${index}`} className="hover:bg-slate-50/60 transition duration-150">
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                {isCheckOut ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                              Check-Out
                            </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              Check-In
                            </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-900">{item.employeeName}</td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 text-xs">{item.departmentName || 'Chưa gán'}</td>
                                            <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-600 text-xs">
                                                {isCheckOut ? formatTime(item.checkOutTime) : formatTime(item.checkInTime)}
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                {isLate ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" /> Đi muộn
                            </span>
                                                ) : isEarly ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" /> Về sớm
                            </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" /> Đúng giờ
                            </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* CỘT PHẢI (1/3): Thẻ Chưa Đăng Ký (Unknown Cards) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                                <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">Thẻ Chưa Đăng Ký</h2>
                                <p className="text-[11px] text-slate-400">Quét thẻ mới để lấy mã gán cho nhân viên</p>
                            </div>
                        </div>
                        <button
                            onClick={refreshUnknownCards}
                            disabled={refreshingCards}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                            title="Làm mới danh sách thẻ lạ"
                        >
                            <RotateCw className={`w-4 h-4 ${refreshingCards ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="p-4 flex-1">
                        {unknownCards.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                <CreditCard className="w-8 h-8 opacity-25 mb-2" />
                                <p className="text-xs font-medium">Không có thẻ lạ quét gần đây</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Khi quẹt thẻ mới, mã UID sẽ xuất hiện tại đây</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {unknownCards.map((card) => {
                                    const isCopied = copiedCode === card.cardCode;
                                    return (
                                        <div
                                            key={card.id}
                                            className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between transition group"
                                        >
                                            <div>
                                                <div className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                                                    {card.cardCode}
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    {formatTime(card.scanTime)}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => copyToClipboard(card.cardCode)}
                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition ${
                                                    isCopied
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 shadow-2xs'
                                                }`}
                                                title="Sao chép mã thẻ"
                                            >
                                                {isCopied ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>Đã chép</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                                                        <span>Chép mã</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-slate-50/80 border-t border-slate-100 text-[11px] text-slate-500 text-center">
                        Mẹo: Bấm <strong>Chép mã</strong> để dán nhanh vào form tạo hồ sơ nhân viên.
                    </div>
                </div>

            </div>
        </div>
    );
};