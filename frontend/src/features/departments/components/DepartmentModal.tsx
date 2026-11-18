import React, { useState, useEffect } from 'react';
import { X, Building2, Loader2, AlertCircle } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { DepartmentResponse } from '../../../types/employee';
import { departmentApi, type DepartmentRequest } from '../api/departmentApi';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: DepartmentResponse | null;
}

export const DepartmentModal: React.FC<Props> = ({
                                                     isOpen,
                                                     onClose,
                                                     onSuccess,
                                                     initialData,
                                                 }) => {
    const isEdit = Boolean(initialData);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
        } else {
            setName('');
        }
        setErrorMsg(null);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setErrorMsg('Tên phòng ban không được để trống');
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            const payload: DepartmentRequest = { name: name.trim() };
            if (isEdit && initialData) {
                await departmentApi.update(initialData.id, payload);
            } else {
                await departmentApi.create(payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string; extraData?: Record<string, string> }>;
            const resData = axiosErr.response?.data;
            if (resData?.extraData && typeof resData.extraData === 'object') {
                const details = Object.entries(resData.extraData)
                    .map(([field, msg]) => `${field}: ${msg}`)
                    .join(' | ');
                setErrorMsg(details);
            } else {
                setErrorMsg(resData?.message || 'Có lỗi xảy ra, vui lòng thử lại');
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
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <h2 className="text-base font-bold text-slate-900">
                            {isEdit ? 'Chỉnh sửa Phòng ban' : 'Thêm Phòng ban Mới'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errorMsg && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                            Tên phòng ban *
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={100}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ví dụ: Phòng Kỹ thuật, Phòng QA..."
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
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
                            <span>{isEdit ? 'Cập nhật' : 'Thêm phòng ban'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};