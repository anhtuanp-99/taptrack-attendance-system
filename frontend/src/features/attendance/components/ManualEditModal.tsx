import React, { useState, useEffect } from 'react';
import { X, FileEdit, Loader2, AlertCircle, Lock } from 'lucide-react';
import type { AxiosError } from 'axios';
import { attendanceApi } from '../api/attendanceApi';
import type { EmployeeResponse } from '../../../types/employee';
import type { AdminAttendanceResponse } from '../../../types/attendance';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    employees: EmployeeResponse[];
    preselectedEmployeeId?: number;
    initialRecord?: AdminAttendanceResponse | null;
}

const formatDateLocal = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const extractTime = (isoDateTime: string | null): string => {
    if (!isoDateTime || !isoDateTime.includes('T')) return '';
    return isoDateTime.split('T')[1].slice(0, 5);
};

export const ManualEditModal: React.FC<Props> = ({
                                                     isOpen,
                                                     onClose,
                                                     onSuccess,
                                                     employees,
                                                     preselectedEmployeeId,
                                                     initialRecord,
                                                 }) => {
    const [employeeId, setEmployeeId] = useState<number | ''>('');
    const [workDate, setWorkDate] = useState('');
    const [checkInTime, setCheckInTime] = useState('');
    const [checkOutTime, setCheckOutTime] = useState('');
    const [reason, setReason] = useState('');

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const isEditExisting = Boolean(initialRecord);

    useEffect(() => {
        if (!isOpen) return;
        if (initialRecord) {
            setEmployeeId(initialRecord.employeeId);
            setWorkDate(initialRecord.workDate);
            setCheckInTime(extractTime(initialRecord.checkInTime));
            setCheckOutTime(extractTime(initialRecord.checkOutTime));
            setReason(initialRecord.editReason || '');
        } else {
            setEmployeeId(preselectedEmployeeId || employees[0]?.id || '');
            setWorkDate(formatDateLocal(new Date()));
            setCheckInTime('08:00');
            setCheckOutTime('17:00');
            setReason('');
        }
        setErrorMsg(null);
    }, [isOpen, preselectedEmployeeId, initialRecord, employees]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId) {
            setErrorMsg('Vui lòng chọn nhân viên cần điều chỉnh công');
            return;
        }
        if (!workDate) {
            setErrorMsg('Vui lòng chọn ngày làm việc');
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            await attendanceApi.manualEdit({
                employeeId: Number(employeeId),
                workDate,
                checkInTime: checkInTime ? `${workDate}T${checkInTime}:00` : null,
                checkOutTime: checkOutTime ? `${workDate}T${checkOutTime}:00` : null,
                reason: reason.trim() || undefined,
            });
            onSuccess();
            onClose();
        } catch (err) {
            const axiosErr = err as AxiosError<{
                message?: string;
                extraData?: Record<string, string>;
            }>;
            const resData = axiosErr.response?.data;
            if (resData?.extraData && typeof resData.extraData === 'object') {
                const details = Object.entries(resData.extraData)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' | ');
                setErrorMsg(details);
            } else {
                setErrorMsg(resData?.message || 'Có lỗi xảy ra khi cập nhật giờ công');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                            <FileEdit className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                {isEditExisting ? 'Điều chỉnh Giờ công' : 'Bổ sung Công Thủ công'}
                            </h2>
                            <p className="text-[11px] text-slate-400">
                                {isEditExisting
                                    ? 'Cập nhật lại giờ vào / giờ ra cho bản ghi đã chọn'
                                    : 'Ghi nhận công cho nhân viên quên quẹt thẻ'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
                    {errorMsg && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Nếu đang sửa dòng có sẵn -> Khóa cố định Nhân viên & Ngày */}
                    {isEditExisting && initialRecord ? (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                            <div>
                                <div className="text-xs font-bold text-slate-900">
                                    {initialRecord.employeeName}{' '}
                                    <span className="font-mono text-indigo-600">({initialRecord.employeeCode})</span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                    {initialRecord.departmentName} • Ngày:{' '}
                                    <span className="font-mono font-semibold text-slate-700">{initialRecord.workDate}</span>
                                </div>
                            </div>
                            <span
                                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400"
                                title="Không thể đổi nhân viên của bản ghi đã tồn tại"
                            >
                <Lock className="w-3.5 h-3.5" />
              </span>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Nhân viên *
                                </label>
                                <select
                                    required
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(Number(e.target.value))}
                                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                                >
                                    <option value="" disabled>-- Chọn nhân viên --</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.fullName} ({emp.employeeCode})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Ngày làm việc *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={workDate}
                                    onChange={(e) => setWorkDate(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                                />
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Giờ Check-In
                            </label>
                            <input
                                type="time"
                                value={checkInTime}
                                onChange={(e) => setCheckInTime(e.target.value)}
                                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Giờ Check-Out
                            </label>
                            <input
                                type="time"
                                value={checkOutTime}
                                onChange={(e) => setCheckOutTime(e.target.value)}
                                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                            Lý do điều chỉnh
                        </label>
                        <textarea
                            rows={2}
                            maxLength={500}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ví dụ: Quên mang thẻ RFID, thiết bị mất kết nối mạng..."
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none resize-none"
                        />
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>Lưu điều chỉnh</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};