import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export const ConfirmModal: React.FC<Props> = ({
                                                  isOpen,
                                                  onClose,
                                                  onConfirm,
                                                  title,
                                                  message,
                                                  confirmText = 'Xác nhận',
                                                  cancelText = 'Hủy',
                                                  variant = 'danger',
                                                  loading = false,
                                              }) => {
    if (!isOpen) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
                    iconBg: 'bg-amber-50 border-amber-200',
                    btnBg: 'bg-amber-600 hover:bg-amber-700',
                };
            case 'info':
                return {
                    icon: <Info className="w-6 h-6 text-indigo-600" />,
                    iconBg: 'bg-indigo-50 border-indigo-200',
                    btnBg: 'bg-indigo-600 hover:bg-indigo-700',
                };
            case 'danger':
            default:
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
                    iconBg: 'bg-rose-50 border-rose-200',
                    btnBg: 'bg-rose-600 hover:bg-rose-700',
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl border flex-shrink-0 ${styles.iconBg}`}>
                        {styles.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-900">{title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-xs transition ${styles.btnBg} disabled:opacity-50`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};