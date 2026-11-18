import React, { useEffect, useState, useCallback } from 'react';
import { Building2, Plus, Search, Edit3, Trash2, RotateCw } from 'lucide-react';
import { departmentApi } from './api/departmentApi';
import { DepartmentModal } from './components/DepartmentModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import type { DepartmentResponse } from '../../types/employee';

export const DepartmentListPage: React.FC = () => {
    const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal thêm/sửa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<DepartmentResponse | null>(null);

    // Modal xác nhận xóa
    const [deletingDept, setDeletingDept] = useState<DepartmentResponse | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setActionError(null);
        try {
            const data = await departmentApi.list();
            setDepartments(data);
        } catch (err) {
            console.error('Lỗi khi tải danh sách phòng ban:', err);
            setActionError('Không thể tải danh mục phòng ban.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOpenAdd = () => {
        setEditingDept(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (dept: DepartmentResponse) => {
        setEditingDept(dept);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingDept) return;
        setDeleteLoading(true);
        try {
            await departmentApi.delete(deletingDept.id);
            setDeletingDept(null);
            loadData();
        } catch (err) {
            console.error('Lỗi xóa phòng ban:', err);
            setActionError('Không thể xóa phòng ban đang có nhân viên trực thuộc.');
            setDeletingDept(null);
        } finally {
            setDeleteLoading(false);
        }
    };

    const filteredDepts = departments.filter((d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Phòng ban</h1>
                    <p className="text-sm text-slate-500 mt-1">Cơ cấu tổ chức và đơn vị trực thuộc hệ thống</p>
                </div>

                <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Thêm phòng ban</span>
                </button>
            </div>

            {actionError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center justify-between">
                    <span>{actionError}</span>
                    <button onClick={() => setActionError(null)} className="text-xs font-semibold hover:underline">
                        Đóng
                    </button>
                </div>
            )}

            {/* Toolbar Filter */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm phòng ban..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                    />
                </div>

                <button
                    onClick={loadData}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    title="Tải lại"
                >
                    <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Grid Cards Phòng ban */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? (
                    <div className="col-span-full py-16 text-center text-slate-400">
                        Đang tải dữ liệu phòng ban...
                    </div>
                ) : filteredDepts.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                        <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">Chưa có phòng ban nào phù hợp</p>
                    </div>
                ) : (
                    filteredDepts.map((dept) => (
                        <div
                            key={dept.id}
                            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-slate-900 text-sm truncate">{dept.name}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5 font-mono">ID: #{dept.id}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition">
                                <button
                                    onClick={() => handleOpenEdit(dept)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                    title="Chỉnh sửa tên"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDeletingDept(dept)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                    title="Xóa phòng ban"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Thêm / Chỉnh sửa */}
            <DepartmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadData}
                initialData={editingDept}
            />

            {/* Modal xác nhận xóa nhạy cảm */}
            <ConfirmModal
                isOpen={Boolean(deletingDept)}
                onClose={() => setDeletingDept(null)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa phòng ban?"
                message={`Bạn có chắc chắn muốn xóa phòng ban "${deletingDept?.name}" không? Thao tác này sẽ thất bại nếu đang có nhân viên thuộc phòng ban này.`}
                confirmText="Xác nhận xóa"
                variant="danger"
                loading={deleteLoading}
            />
        </div>
    );
};