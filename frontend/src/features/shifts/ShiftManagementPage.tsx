import React, { useEffect, useState, useCallback } from 'react';
import {
    Clock,
    Plus,
    Trash2,
    ChevronLeft,
    ChevronRight,
    User,
    CalendarCheck,
    RotateCw
} from 'lucide-react';
import { shiftApi } from './api/shiftApi';
import { employeeApi } from '../employees/api/employeeApi';
import { ShiftTemplateModal } from './components/ShiftTemplateModal';
import { AssignShiftModal } from './components/AssignShiftModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import type { ShiftTemplateResponse, WeeklyScheduleResponse } from '../../types/shift';
import type { EmployeeResponse } from '../../types/employee';

// Định dạng ngày theo YYYY-MM-DD theo múi giờ local
const formatDateLocal = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Hàm lấy ngày Thứ Hai của tuần theo một mốc ngày bất kỳ
const getMondayOfDate = (d: Date): string => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    return formatDateLocal(date);
};

const dayNamesVi = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

export const ShiftManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'templates' | 'schedule'>('templates');

    // Templates State
    const [templates, setTemplates] = useState<ShiftTemplateResponse[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [deletingTemplate, setDeletingTemplate] = useState<ShiftTemplateResponse | null>(null);

    // Scheduling State
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [weekStart, setWeekStart] = useState<string>(() => getMondayOfDate(new Date()));
    const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleResponse | null>(null);
    const [loadingSchedule, setLoadingSchedule] = useState(false);

    // Assign Modal
    const [assigningDate, setAssigningDate] = useState<string | null>(null);

    // 1. Tải danh sách Mẫu Ca
    const loadTemplates = useCallback(async () => {
        setLoadingTemplates(true);
        try {
            const data = await shiftApi.listTemplates();
            setTemplates(data);
        } catch (err) {
            console.error('Lỗi tải danh sách ca làm việc:', err);
        } finally {
            setLoadingTemplates(false);
        }
    }, []);

    // 2. Tải danh sách Nhân viên để phân lịch
    const loadEmployees = useCallback(async () => {
        try {
            const res = await employeeApi.getEmployees({ size: 100, employmentStatus: 'ACTIVE' });
            setEmployees(res.content);
            if (res.content.length > 0) {
                setSelectedEmployeeId((prev) => prev ?? res.content[0].id);
            }
        } catch (err) {
            console.error('Lỗi tải nhân viên:', err);
        }
    }, []);

    // 3. Tải lịch tuần của nhân viên đang chọn
    const loadSchedule = useCallback(async () => {
        if (!selectedEmployeeId) return;
        setLoadingSchedule(true);
        try {
            const res = await shiftApi.getEmployeeWeeklySchedule(selectedEmployeeId, weekStart);
            setWeeklySchedule(res);
        } catch (err) {
            console.error('Lỗi tải lịch tuần:', err);
            setWeeklySchedule(null);
        } finally {
            setLoadingSchedule(false);
        }
    }, [selectedEmployeeId, weekStart]);

    useEffect(() => {
        void loadTemplates();
        void loadEmployees();
    }, [loadTemplates, loadEmployees]);

    useEffect(() => {
        if (activeTab === 'schedule' && selectedEmployeeId) {
            void loadSchedule();
        }
    }, [activeTab, selectedEmployeeId, weekStart, loadSchedule]);

    const handleDeleteTemplate = async () => {
        if (!deletingTemplate) return;
        try {
            await shiftApi.deleteTemplate(deletingTemplate.id);
            setDeletingTemplate(null);
            await loadTemplates();
        } catch (err) {
            console.error('Lỗi xóa mẫu ca:', err);
        }
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

    const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ca làm việc & Lịch phân công</h1>
                    <p className="text-sm text-slate-500 mt-1">Cấu hình khung thời gian ca và phân ca làm việc theo tuần</p>
                </div>

                {/* Tabs Switch */}
                <div className="inline-flex bg-slate-200/70 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setActiveTab('templates')}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                            activeTab === 'templates'
                                ? 'bg-white text-indigo-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Mẫu Ca làm việc
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('schedule')}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                            activeTab === 'schedule'
                                ? 'bg-white text-indigo-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Lịch Phân ca Tuần
                    </button>
                </div>
            </div>

            {/* ================= TAB 1: MẪU CA LÀM VIỆC ================= */}
            {activeTab === 'templates' && (
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-800">Danh sách Mẫu Ca</h2>
                        <button
                            type="button"
                            onClick={() => setIsTemplateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tạo Mẫu Ca Mới</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {loadingTemplates ? (
                            <div className="col-span-full py-16 text-center text-slate-400">Đang tải danh sách ca...</div>
                        ) : templates.length === 0 ? (
                            <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm font-medium">Chưa có mẫu ca nào</p>
                                <p className="text-xs text-slate-400 mt-1">Bấm &quot;Tạo Mẫu Ca Mới&quot; để thiết lập khung giờ đầu tiên</p>
                            </div>
                        ) : (
                            templates.map((tpl) => (
                                <div
                                    key={tpl.id}
                                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
                                >
                                    <div className="space-y-1">
                                        <span className="font-bold text-slate-900 text-sm">{tpl.name}</span>
                                        <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100 w-fit">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{tpl.startTime.slice(0, 5)} - {tpl.endTime.slice(0, 5)}</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setDeletingTemplate(tpl)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                        title="Xóa mẫu ca"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ================= TAB 2: LỊCH PHÂN CA TUẦN ================= */}
            {activeTab === 'schedule' && (
                <div className="space-y-5">
                    {/* Toolbar Lựa chọn Nhân viên & Chọn Tuần */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Dropdown Nhân viên */}
                        <div className="flex items-center gap-3 w-full md:w-80">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                                <User className="w-4 h-4" />
                            </div>
                            <select
                                value={selectedEmployeeId ?? ''}
                                onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                                className="flex-1 px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                            >
                                {employees.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.fullName} ({e.employeeCode})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Điều hướng Tuần */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handlePrevWeek}
                                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition"
                                title="Tuần trước"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl font-mono">
                                Tuần bắt đầu: {weekStart}
                            </div>
                            <button
                                type="button"
                                onClick={handleNextWeek}
                                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition"
                                title="Tuần kế tiếp"
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

                    {/* Lưới 7 Ngày Trong Tuần */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5">
                        {dayNamesVi.map((name, index) => {
                            const dayItem = weeklySchedule?.days?.[index];
                            const dateStr = dayItem?.date || '';
                            const isAssigned = dayItem?.status === 'ASSIGNED';

                            return (
                                <div
                                    key={name}
                                    className={`bg-white rounded-2xl border p-4 flex flex-col justify-between min-h-[160px] transition ${
                                        isAssigned ? 'border-indigo-200 shadow-xs' : 'border-slate-200/80 bg-slate-50/40'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{name}</span>
                                            <span className="text-[11px] font-mono text-slate-400">{dateStr.slice(5)}</span>
                                        </div>

                                        <div className="mt-3">
                                            {isAssigned ? (
                                                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 space-y-1">
                                                    <div className="text-xs font-bold text-indigo-900 truncate">
                                                        {dayItem.shiftName}
                                                    </div>
                                                    <div className="text-[11px] font-mono text-indigo-600">
                                                        {dayItem.startTime?.slice(0, 5)} - {dayItem.endTime?.slice(0, 5)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-4 text-center text-slate-400 text-xs">
                                                    Nghỉ (Chưa có ca)
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setAssigningDate(dateStr)}
                                        className="mt-3 w-full py-1.5 px-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs font-medium text-slate-600 transition flex items-center justify-center gap-1"
                                    >
                                        <CalendarCheck className="w-3.5 h-3.5" />
                                        <span>{isAssigned ? 'Đổi ca' : 'Gán ca'}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Modal Thêm Mẫu Ca */}
            <ShiftTemplateModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onSuccess={loadTemplates}
            />

            {/* Modal Phân Ca Theo Ngày */}
            {assigningDate && selectedEmployee && (
                <AssignShiftModal
                    isOpen={Boolean(assigningDate)}
                    onClose={() => setAssigningDate(null)}
                    onSuccess={loadSchedule}
                    employeeId={selectedEmployee.id}
                    employeeName={selectedEmployee.fullName}
                    date={assigningDate}
                    templates={templates}
                />
            )}

            {/* Confirm Xóa Ca */}
            <ConfirmModal
                isOpen={Boolean(deletingTemplate)}
                onClose={() => setDeletingTemplate(null)}
                onConfirm={handleDeleteTemplate}
                title="Xác nhận xóa mẫu ca?"
                message={`Bạn có chắc chắn muốn xóa mẫu ca "${deletingTemplate?.name}"? Các lịch làm việc đã phân theo ca này có thể bị ảnh hưởng.`}
                confirmText="Xóa mẫu ca"
                variant="danger"
            />
        </div>
    );
};