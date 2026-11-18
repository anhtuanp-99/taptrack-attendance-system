import React, { useState } from 'react';
import { X, CalendarPlus, Loader2, AlertCircle } from 'lucide-react';
import type { AxiosError } from 'axios';
import { shiftApi } from '../api/shiftApi';
import type { ShiftTemplateResponse } from '../../../types/shift';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    employeeId: number;
    employeeName: string;
    date: string;
    templates: ShiftTemplateResponse[];
}

export const AssignShiftModal: React.FC<Props> = ({
                                                      isOpen,
                                                      onClose,
                                                      onSuccess,
                                                      employeeId,
                                                      employeeName,
                                                      date,
                                                      templates,
                                                  }) => {
    const [templateId, setTemplateId] = useState<number | ''>(templates[0]?.id || '');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!templateId) {
            setErrorMsg('Vui lòng chọn mẫu ca');
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            await shiftApi.createAssignment({
                employeeId,
                shiftTemplateId: Number(templateId),
                workDate: date,
            });
            onSuccess();
            onClose();
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string; extraData?: Record<string, string> }>;
            const resData = axiosErr.response?.data;
            if (resData?.extraData && typeof resData.extraData === 'object') {
                const details = Object.entries(resData.extraData)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' | ');
                setErrorMsg(details);
            } else {
                setErrorMsg(resData?.message || 'Có lỗi khi phân ca làm việc');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <CalendarPlus className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-slate-900 text-sm">Phân ca làm việc</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {errorMsg && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                        <div>Nhân viên: <strong className="text-slate-900">{employeeName}</strong></div>
                        <div>Ngày áp dụng: <strong className="font-mono text-indigo-600">{date}</strong></div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                            Chọn mẫu ca *
                        </label>
                        <select
                            value={templateId}
                            onChange={(e) => setTemplateId(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                        >
                            {templates.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} ({t.startTime.slice(0, 5)} - {t.endTime.slice(0, 5)})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>Lưu phân ca</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};