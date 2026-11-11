import React, { useState, useEffect } from 'react';
import { X, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import type { AxiosError } from 'axios';
import type {
    EmployeeResponse,
    DepartmentResponse,
    AccountCreateRequest,
    EmployeeUpdateRequest,
    EmploymentStatus
} from '../../../types/employee';
import { employeeApi } from '../api/employeeApi';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: EmployeeResponse | null;
    departments: DepartmentResponse[];
}

export const EmployeeModal: React.FC<Props> = ({
                                                   isOpen,
                                                   onClose,
                                                   onSuccess,
                                                   initialData,
                                                   departments,
                                               }) => {
    const isEdit = Boolean(initialData);

    const [employeeCode, setEmployeeCode] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [departmentId, setDepartmentId] = useState<number | ''>('');
    const [jobTitle, setJobTitle] = useState('');
    const [cardCode, setCardCode] = useState('');
    const [status, setStatus] = useState<EmploymentStatus>('ACTIVE');

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setEmployeeCode(initialData.employeeCode || '');
            setFullName(initialData.fullName || '');
            setEmail(initialData.email || '');
            setDepartmentId(initialData.departmentId || '');
            setJobTitle(initialData.jobTitle || '');
            setCardCode(initialData.cardCode || '');
            setStatus(initialData.employmentStatus || 'ACTIVE');
        } else {
            setEmployeeCode('');
            setFullName('');
            setEmail('');
            setPassword('');
            setDepartmentId(departments[0]?.id || '');
            setJobTitle('');
            setCardCode('');
            setStatus('ACTIVE');
        }
        setErrorMsg(null);
    }, [initialData, departments, isOpen]);

    if (!isOpen) return null;

    const handlePasteCard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) setCardCode(text.trim());
        } catch {
            // Bỏ qua nếu chặn quyền clipboard
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!departmentId) {
            setErrorMsg('Vui lòng chọn phòng ban');
            return;
        }
        if (!cardCode.trim()) {
            setErrorMsg('Vui lòng nhập hoặc dán mã thẻ RFID');
            return;
        }
        if (!isEdit && !employeeCode.trim()) {
            setErrorMsg('Vui lòng nhập mã nhân viên');
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            if (isEdit && initialData) {
                const payload: EmployeeUpdateRequest = {
                    fullName,
                    departmentId: Number(departmentId),
                    jobTitle: jobTitle.trim() || undefined,
                    cardCode: cardCode.trim(),
                    employmentStatus: status,
                };
                await employeeApi.updateEmployee(initialData.id, payload);
            } else {
                const payload: AccountCreateRequest = {
                    email: email.trim(),
                    fullName: fullName.trim(),
                    initialPassword: password,
                    role: 'EMPLOYEE',
                    employeeProfile: {
                        employeeCode: employeeCode.trim().toUpperCase(),
                        departmentId: Number(departmentId),
                        cardCode: cardCode.trim(),
                        jobTitle: jobTitle.trim() || undefined,
                    },
                };
                await employeeApi.createEmployee(payload);
            }
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
                    .map(([field, msg]) => `${field}: ${msg}`)
                    .join(' | ');
                setErrorMsg(details);
            } else {
                setErrorMsg(resData?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900">
                        {isEdit ? 'Chỉnh sửa Hồ sơ Nhân viên' : 'Thêm Nhân viên Mới'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                    {errorMsg && (
                        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Hàng 1: Mã nhân viên & Họ tên */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                Mã NV *
                            </label>
                            <input
                                type="text"
                                required
                                disabled={isEdit}
                                value={employeeCode}
                                onChange={(e) => setEmployeeCode(e.target.value)}
                                placeholder="NV001"
                                className="w-full px-3.5 py-2 uppercase font-mono bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                Họ và tên *
                            </label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Nguyễn Minh Anh"
                                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Hàng 2: Email & Mật khẩu (chỉ hiển thị khi tạo mới) */}
                    {!isEdit && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                    Email đăng nhập *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="minhanh@gmail.com"
                                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                    Mật khẩu ban đầu *
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Tối thiểu 6 ký tự"
                                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Hàng 3: Phòng ban & Chức danh */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                Phòng ban *
                            </label>
                            <select
                                required
                                value={departmentId}
                                onChange={(e) => setDepartmentId(Number(e.target.value))}
                                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                            >
                                <option value="" disabled>-- Chọn phòng ban --</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                Chức danh / Vị trí
                            </label>
                            <input
                                type="text"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                placeholder="Kĩ sư kiểm thử"
                                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Hàng 4: Mã thẻ RFID */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                                Mã thẻ RFID (Card Code) *
                            </label>
                            <button
                                type="button"
                                onClick={handlePasteCard}
                                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition"
                            >
                                Dán từ Clipboard
                            </button>
                        </div>
                        <div className="relative">
                            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                required
                                value={cardCode}
                                onChange={(e) => setCardCode(e.target.value)}
                                placeholder="Ví dụ: E00005 hoặc 4A2B9C1D"
                                className="w-full pl-10 pr-4 py-2 font-mono text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none uppercase"
                            />
                        </div>
                    </div>

                    {/* Trạng thái khi chỉnh sửa */}
                    {isEdit && (
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                Trạng thái làm việc *
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as EmploymentStatus)}
                                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                            >
                                <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                                <option value="INACTIVE">Ngừng hoạt động (INACTIVE)</option>
                            </select>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
                            <span>{isEdit ? 'Lưu thay đổi' : 'Thêm nhân viên'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};