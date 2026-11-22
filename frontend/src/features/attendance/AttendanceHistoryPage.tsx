import React, { useEffect, useState, useCallback } from 'react';
import {
    Clock,
    FileEdit,
    RotateCw,
    CheckCircle2,
    AlertTriangle,
    UserCheck,
    Download,
    Calendar,
    Eye,
    Plus,
} from 'lucide-react';
import { attendanceApi } from './api/attendanceApi';
import { employeeApi } from '../employees/api/employeeApi';
import { ManualEditModal } from './components/ManualEditModal';
import { AttendanceDetailModal } from './components/AttendanceDetailModal';
import type { AdminAttendanceResponse, MonthlyReportResponse } from '../../types/attendance';
import type { EmployeeResponse, DepartmentResponse } from '../../types/employee';

const formatDateLocal = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getFirstDayOfMonth = (): string => {
    const now = new Date();
    return formatDateLocal(new Date(now.getFullYear(), now.getMonth(), 1));
};

const getToday = (): string => formatDateLocal(new Date());

export const AttendanceHistoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'history' | 'monthly'>('history');

    // Shared master data
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponse[]>([]);

    // --- Tab 1: History Filters ---
    const [fromDate, setFromDate] = useState(getFirstDayOfMonth);
    const [toDate, setToDate] = useState(getToday);
    const [selectedDept, setSelectedDept] = useState<number | ''>('');
    const [selectedEmp, setSelectedEmp] = useState<number | ''>('');
    const [records, setRecords] = useState<AdminAttendanceResponse[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<AdminAttendanceResponse | null>(null);
    const [viewingRecord, setViewingRecord] = useState<AdminAttendanceResponse | null>(null);

    // --- Tab 2: Monthly Report Filters ---
    const now = new Date();
    const [reportYear, setReportYear] = useState(now.getFullYear());
    const [reportMonth, setReportMonth] = useState(now.getMonth() + 1);
    const [reportDept, setReportDept] = useState<number | ''>('');
    const [monthlyReports, setMonthlyReports] = useState<MonthlyReportResponse[]>([]);
    const [loadingReport, setLoadingReport] = useState(false);

    // Load master lists
    useEffect(() => {
        const fetchMaster = async () => {
            try {
                const [empPage, deptList] = await Promise.all([
                    employeeApi.getEmployees({ size: 200 }),
                    employeeApi.getDepartments(),
                ]);
                setEmployees(empPage.content);
                setDepartments(deptList);
            } catch (err) {
                console.error('Lỗi tải danh mục nhân viên/phòng ban:', err);
            }
        };
        void fetchMaster();
    }, []);

    // Load History
    const loadHistory = useCallback(async () => {
        setLoadingHistory(true);
        try {
            const pageData = await attendanceApi.getHistory({
                from: fromDate,
                to: toDate,
                departmentId: selectedDept !== '' ? selectedDept : undefined,
                employeeId: selectedEmp !== '' ? selectedEmp : undefined,
                page: 0,
                size: 50,
            });
            setRecords(pageData.content);
        } catch (err) {
            console.error('Lỗi tải lịch sử chấm công:', err);
        } finally {
            setLoadingHistory(false);
        }
    }, [fromDate, toDate, selectedDept, selectedEmp]);

    // Load Monthly Report
    const loadMonthlyReport = useCallback(async () => {
        setLoadingReport(true);
        try {
            const data = await attendanceApi.getMonthlyReport({
                year: reportYear,
                month: reportMonth,
                departmentId: reportDept !== '' ? reportDept : undefined,
            });
            setMonthlyReports(data);
        } catch (err) {
            console.error('Lỗi tải báo cáo tháng:', err);
        } finally {
            setLoadingReport(false);
        }
    }, [reportYear, reportMonth, reportDept]);

    useEffect(() => {
        if (activeTab === 'history') {
            void loadHistory();
        } else {
            void loadMonthlyReport();
        }
    }, [activeTab, loadHistory, loadMonthlyReport]);

    const formatTimeShort = (isoString: string | null) => {
        if (!isoString) return '--:--';
        return isoString.includes('T') ? isoString.split('T')[1].slice(0, 5) : isoString.slice(0, 5);
    };

    // Xuất nhanh file CSV báo cáo tháng
    const handleExportCsv = () => {
        if (monthlyReports.length === 0) return;
        const headers = [
            'Mã NV',
            'Họ và Tên',
            'Phòng ban',
            'Đúng giờ (ngày)',
            'Đi muộn (ngày)',
            'Về sớm (ngày)',
            'Vắng mặt (ngày)',
            'Thiếu Check-out (ngày)',
        ];
        const rows = monthlyReports.map((r) => [
            r.employeeId,
            `"${r.employeeName}"`,
            `"${r.departmentName}"`,
            r.onTimeDays,
            r.lateDays,
            r.earlyLeaveDays,
            r.absentDays,
            r.missingCheckOutDays,
        ]);
        const csvContent =
            '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `BaoCaoChamCong_${reportMonth}_${reportYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dữ liệu & Báo cáo Chấm công</h1>
                    <p className="text-sm text-slate-500 mt-1">Đối soát lịch sử quẹt thẻ, điều chỉnh công và tổng hợp tháng</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {activeTab === 'history' && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingRecord(null);
                                setIsEditModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Bổ sung công thủ công</span>
                        </button>
                    )}

                    {/* Switch Tabs */}
                    <div className="inline-flex bg-slate-200/70 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setActiveTab('history')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                                activeTab === 'history'
                                    ? 'bg-white text-indigo-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Lịch sử Quẹt thẻ
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('monthly')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                                activeTab === 'monthly'
                                    ? 'bg-white text-indigo-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Báo cáo Tháng
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= TAB 1: LỊCH SỬ QUẸT THẺ ================= */}
            {activeTab === 'history' && (
                <div className="space-y-5">
                    {/* Toolbar Filters: Gọn trên 1 hàng */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-end justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Từ ngày</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Đến ngày</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Phòng ban</label>
                                <select
                                    value={selectedDept}
                                    onChange={(e) => {
                                        setSelectedDept(e.target.value ? Number(e.target.value) : '');
                                        setSelectedEmp('');
                                    }}
                                    className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none min-w-[155px]"
                                >
                                    <option value="">Tất cả phòng ban</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Nhân viên</label>
                                <select
                                    value={selectedEmp}
                                    onChange={(e) => setSelectedEmp(e.target.value ? Number(e.target.value) : '')}
                                    className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none min-w-[190px]"
                                >
                                    <option value="">Tất cả nhân viên</option>
                                    {employees
                                        .filter((e) => !selectedDept || e.departmentId === selectedDept)
                                        .map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.fullName} ({emp.employeeCode})
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => void loadHistory()}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/80 rounded-xl transition"
                            title="Làm mới dữ liệu"
                        >
                            <RotateCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Data Table: 5 Cột tối ưu, không tràn ngang */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100 font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Nhân viên</th>
                                    <th className="px-6 py-3.5">Ngày làm việc</th>
                                    <th className="px-6 py-3.5">Giờ vào – Giờ ra</th>
                                    <th className="px-6 py-3.5">Trạng thái</th>
                                    <th className="px-6 py-3.5 text-right">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {loadingHistory ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            Đang tải dữ liệu lịch sử chấm công...
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            Không có bản ghi chấm công nào trong khoảng thời gian đã chọn
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((rec) => {
                                        const isAllOnTime =
                                            rec.checkInStatus === 'ON_TIME' && rec.checkOutStatus === 'ON_TIME';

                                        return (
                                            <tr key={rec.id} className="hover:bg-slate-50/70 transition duration-150">
                                                {/* Cột 1: Nhân viên (Gộp Tên + Mã + Phòng ban) */}
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <div className="font-semibold text-slate-900 text-sm">{rec.employeeName}</div>
                                                    <div className="text-[11px] text-slate-500 mt-0.5">
                              <span className="font-mono font-semibold text-indigo-600">
                                {rec.employeeCode}
                              </span>
                                                        <span className="mx-1.5 text-slate-300">•</span>
                                                        <span>{rec.departmentName}</span>
                                                    </div>
                                                </td>

                                                {/* Cột 2: Ngày làm việc */}
                                                <td className="px-6 py-3.5 whitespace-nowrap font-mono text-xs font-semibold text-slate-700">
                                                    {rec.workDate}
                                                </td>

                                                {/* Cột 3: Giờ vào – Giờ ra */}
                                                <td className="px-6 py-3.5 whitespace-nowrap font-mono text-xs text-slate-800">
                                                    <span className="font-semibold">{formatTimeShort(rec.checkInTime)}</span>
                                                    <span className="mx-2 text-slate-300">→</span>
                                                    <span className={rec.checkOutTime ? 'font-semibold' : 'text-slate-400'}>
                              {formatTimeShort(rec.checkOutTime)}
                            </span>
                                                </td>

                                                {/* Cột 4: Trạng thái tổng hợp */}
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {isAllOnTime ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                  <CheckCircle2 className="w-3 h-3" /> Đúng giờ
                                </span>
                                                        ) : (
                                                            <>
                                                                {rec.checkInStatus === 'LATE' && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80">
                                      <AlertTriangle className="w-3 h-3" />
                                      Muộn {rec.lateMinutes ? `${rec.lateMinutes}p` : ''}
                                    </span>
                                                                )}
                                                                {rec.checkOutStatus === 'EARLY_LEAVE' && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                                      <AlertTriangle className="w-3 h-3" />
                                      Về sớm {rec.earlyLeaveMinutes ? `${rec.earlyLeaveMinutes}p` : ''}
                                    </span>
                                                                )}
                                                                {rec.checkInStatus === 'ON_TIME' && !rec.checkOutStatus && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                                      Đang trong ca
                                    </span>
                                                                )}
                                                            </>
                                                        )}

                                                        {rec.isManualEdit && (
                                                            <span
                                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80"
                                                                title="Bản ghi đã được Admin điều chỉnh thủ công"
                                                            >
                                  <UserCheck className="w-3 h-3" /> Đã sửa
                                </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Cột 5: Thao tác (Xem chi tiết + Sửa) */}
                                                <td className="px-6 py-3.5 whitespace-nowrap text-right">
                                                    <div className="inline-flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewingRecord(rec)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                                            title="Xem chi tiết bản ghi"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingRecord(rec);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                                            title="Điều chỉnh giờ công"
                                                        >
                                                            <FileEdit className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= TAB 2: BÁO CÁO TỔNG HỢP THÁNG ================= */}
            {activeTab === 'monthly' && (
                <div className="space-y-5">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                <select
                                    value={reportMonth}
                                    onChange={(e) => setReportMonth(Number(e.target.value))}
                                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                        <option key={m} value={m}>Tháng {m}</option>
                                    ))}
                                </select>
                                <select
                                    value={reportYear}
                                    onChange={(e) => setReportYear(Number(e.target.value))}
                                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                                >
                                    {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                                        <option key={y} value={y}>Năm {y}</option>
                                    ))}
                                </select>
                            </div>

                            <select
                                value={reportDept}
                                onChange={(e) => setReportDept(e.target.value ? Number(e.target.value) : '')}
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none min-w-[160px]"
                            >
                                <option value="">Tất cả phòng ban</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleExportCsv}
                            disabled={monthlyReports.length === 0}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-40"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Xuất file CSV</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100 font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Nhân viên</th>
                                    <th className="px-6 py-3.5">Phòng ban</th>
                                    <th className="px-6 py-3.5 text-center text-emerald-700">Đúng giờ</th>
                                    <th className="px-6 py-3.5 text-center text-amber-700">Đi muộn</th>
                                    <th className="px-6 py-3.5 text-center text-orange-700">Về sớm</th>
                                    <th className="px-6 py-3.5 text-center text-rose-700">Vắng mặt</th>
                                    <th className="px-6 py-3.5 text-center text-slate-600">Thiếu Check-out</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {loadingReport ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                            Đang tổng hợp dữ liệu báo cáo tháng...
                                        </td>
                                    </tr>
                                ) : monthlyReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                            Chưa có dữ liệu tổng hợp cho tháng {reportMonth}/{reportYear}
                                        </td>
                                    </tr>
                                ) : (
                                    monthlyReports.map((item) => (
                                        <tr key={item.employeeId} className="hover:bg-slate-50/60 transition">
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">
                                                {item.employeeName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                                {item.departmentName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center font-mono font-bold text-emerald-600">
                                                {item.onTimeDays}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center font-mono font-bold text-amber-600">
                                                {item.lateDays}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center font-mono font-bold text-orange-600">
                                                {item.earlyLeaveDays}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center font-mono font-bold text-rose-600">
                                                {item.absentDays}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center font-mono font-medium text-slate-600">
                                                {item.missingCheckOutDays}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xem chi tiết */}
            <AttendanceDetailModal
                record={viewingRecord}
                onClose={() => setViewingRecord(null)}
                onEdit={(rec) => {
                    setEditingRecord(rec);
                    setIsEditModalOpen(true);
                }}
            />

            {/* Modal Điều chỉnh công */}
            <ManualEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={loadHistory}
                employees={employees}
                preselectedEmployeeId={selectedEmp !== '' ? selectedEmp : undefined}
                initialRecord={editingRecord}
            />
        </div>
    );
};