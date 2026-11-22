import React from 'react';
import { X, Eye, UserCheck, Cpu, Clock, Calendar, FileText } from 'lucide-react';
import type { AdminAttendanceResponse } from '../../../types/attendance';

interface Props {
    record: AdminAttendanceResponse | null;
    onClose: () => void;
    onEdit: (record: AdminAttendanceResponse) => void;
}

const formatFullTime = (iso: string | null): string => {
    if (!iso) return 'Chưa ghi nhận';
    return iso.includes('T') ? iso.split('T')[1].slice(0, 8) : iso;
};

const formatDateTime = (iso: string | null): string => {
    if (!iso) return '--';
    if (!iso.includes('T')) return iso;
    const [d, t] = iso.split('T');
    return `${d} lúc ${t.slice(0, 8)}`;
};

export const AttendanceDetailModal: React.FC<Props> = ({ record, onClose, onEdit }) => {
    if (!record) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                            <Eye className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Chi tiết Bản ghi Chấm công</h2>
                            <p className="text-[11px] text-slate-400">Mã bản ghi #{record.id}</p>
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

                <div className="p-6 space-y-5 text-sm">
                    {/* Thông tin nhân viên */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <div className="font-bold text-slate-900">{record.employeeName}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                                <span className="font-mono font-semibold text-indigo-600">{record.employeeCode}</span>
                                <span className="mx-1.5 text-slate-300">•</span>
                                <span>{record.departmentName}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[11px] uppercase text-slate-400 font-semibold flex items-center justify-end gap-1">
                                <Calendar className="w-3 h-3" /> Ngày công
                            </div>
                            <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">{record.workDate}</div>
                        </div>
                    </div>

                    {/* Chi tiết thời gian chính xác tới giây */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border border-slate-200/80">
                            <div className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-emerald-600" /> Check-In chi tiết
                            </div>
                            <div className="font-mono text-sm font-bold text-slate-900 mt-1">
                                {formatFullTime(record.checkInTime)}
                            </div>
                            <div className="text-xs mt-1">
                                {record.checkInStatus === 'LATE' ? (
                                    <span className="text-rose-600 font-medium">Đi muộn {record.lateMinutes ?? 0} phút</span>
                                ) : record.checkInStatus === 'ON_TIME' ? (
                                    <span className="text-emerald-600 font-medium">Đúng giờ</span>
                                ) : (
                                    <span className="text-slate-400">--</span>
                                )}
                            </div>
                        </div>

                        <div className="p-3 rounded-xl border border-slate-200/80">
                            <div className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-indigo-600" /> Check-Out chi tiết
                            </div>
                            <div className="font-mono text-sm font-bold text-slate-900 mt-1">
                                {formatFullTime(record.checkOutTime)}
                            </div>
                            <div className="text-xs mt-1">
                                {record.checkOutStatus === 'EARLY_LEAVE' ? (
                                    <span className="text-amber-600 font-medium">Về sớm {record.earlyLeaveMinutes ?? 0} phút</span>
                                ) : record.checkOutStatus === 'ON_TIME' ? (
                                    <span className="text-emerald-600 font-medium">Đúng giờ</span>
                                ) : (
                                    <span className="text-slate-400">Chưa ra ca</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Nguồn ghi nhận & Lịch sử điều chỉnh */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Nguồn ghi nhận:</span>
                            {record.isManualEdit ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <UserCheck className="w-3.5 h-3.5" /> Admin điều chỉnh thủ công
                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium bg-slate-100 text-slate-700">
                  <Cpu className="w-3.5 h-3.5" /> Thiết bị quẹt thẻ RFID
                </span>
                            )}
                        </div>

                        {record.isManualEdit && (
                            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs">
                                <div className="flex items-center justify-between text-amber-800">
                                    <span className="font-semibold">Cập nhật lúc:</span>
                                    <span className="font-mono">{formatDateTime(record.editedAt)}</span>
                                </div>
                                <div>
                  <span className="font-semibold text-amber-800 flex items-center gap-1 mb-1">
                    <FileText className="w-3.5 h-3.5" /> Lý do điều chỉnh:
                  </span>
                                    <p className="text-slate-700 bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
                                        {record.editReason || 'Không có ghi chú lý do'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition"
                    >
                        Đóng
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            onEdit(record);
                        }}
                        className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition"
                    >
                        Điều chỉnh giờ công
                    </button>
                </div>
            </div>
        </div>
    );
};