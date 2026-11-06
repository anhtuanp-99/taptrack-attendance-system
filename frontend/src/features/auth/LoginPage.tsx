import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2, Fingerprint } from 'lucide-react';
import type { AxiosError } from 'axios';
import apiClient from '../../services/apiClient';
import type { ApiResponse, LoginRequest, LoginResponse } from '../../types/api';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);

        try {
            const payload: LoginRequest = { email, password };
            const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload);

            const { accessToken, role } = res.data.data;
            localStorage.setItem('token', accessToken);
            localStorage.setItem('role', role);

            if (role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/portal/my-attendance');
            }
        } catch (err) {
            const axiosError = err as AxiosError<ApiResponse<unknown>>;
            if (axiosError.response?.data?.message) {
                setErrorMsg(axiosError.response.data.message);
            } else {
                setErrorMsg('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100/70 p-4">
            <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 border border-indigo-100">
                        <Fingerprint className="w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">TapTrack Portal</h1>
                    <p className="text-sm text-slate-500 mt-1.5">Hệ thống quản lý chấm công & điểm danh</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                            Email công việc
                        </label>
                        <div className="relative">
                            <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@taptrack.com"
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none text-slate-900 text-sm placeholder:text-slate-400 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none text-slate-900 text-sm placeholder:text-slate-400 transition"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm hover:shadow transition duration-150 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            'Đăng nhập hệ thống'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};