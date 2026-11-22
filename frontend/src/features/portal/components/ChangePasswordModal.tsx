import React, { useState } from 'react';
import { X, KeyRound, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { AxiosError } from 'axios';
import { portalApi } from '../api/portalApi';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePasswordModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    if (!isOpen) return null;

    const resetAndClose = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrorMsg(null);
        setSuccessMsg(null);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (newPassword.length < 6) {
            setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự');
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMsg('Xác nhận mật khẩu mới không khớp');
            return;
        }

        setLoading(true);
        try {
            await portalApi.changePassword({ oldPassword, newPassword });
            setSuccessMsg('Đổi mật khẩu thành công!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                resetAndClose();
            }, 1500);
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
                setErrorMsg(resData?.message || 'Mật khẩu cũ không đúng hoặc có lỗi xảy ra');
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
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <h2 className="text-base font-bold text-slate-900">Đổi Mật Khẩu Cá Nhân</h2>
                    </div>
                    <button
                        onClick={resetAndClose}
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

                    {successMsg && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-medium">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                            Mật khẩu hiện tại *
                        </label>
                        <input
                            type="password"
                            required
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Nhập mật khẩu đang dùng"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                            Mật khẩu mới *
                        </label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Tối thiểu 6 ký tự"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                            Xác nhận mật khẩu mới *
                        </label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Nhập lại mật khẩu mới"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                        />
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={resetAndClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                        >
                            Đóng
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>Cập nhật mật khẩu</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};