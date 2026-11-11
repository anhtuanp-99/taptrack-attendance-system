import React, { useEffect, useState, useCallback } from 'react';
import {
    Users,
    Plus,
    Search,
    Edit3,
    CreditCard,
    CheckCircle2,
    XCircle,
    RotateCw
} from 'lucide-react';
import { employeeApi } from './api/employeeApi';
import { EmployeeModal } from './components/EmployeeModal';
import type { EmployeeResponse, DepartmentResponse } from '../../types/employee';

export const EmployeeListPage: React.FC = () => {
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState<number | ''>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<EmployeeResponse | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [empPage, deptList] = await Promise.all([
                employeeApi.getEmployees({
                    departmentId: selectedDept !== '' ? selectedDept : undefined,
                    employmentStatus: selectedStatus !== '' ? selectedStatus : undefined,
                    page: 0,
                    size: 50,
                }),
                employeeApi.getDepartments(),
            ]);
            setEmployees(empPage.content);
            setDepartments(deptList);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu nhân viên:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedDept, selectedStatus]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOpenAdd = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (emp: EmployeeResponse) => {
        setEditingEmployee(emp);
        setIsModalOpen(true);
    };

    // Lọc client theo tên / mã nhân viên
    const filteredEmployees = employees.filter((emp) => {
        const term = searchTerm.toLowerCase();
        const matchName = emp.fullName?.toLowerCase().includes(term);
        const matchCode = emp.employeeCode?.toLowerCase().includes(term);
        const matchEmail = emp.email?.toLowerCase().includes(term);
        const matchCard = emp.cardCode?.toLowerCase().includes(term);
        return matchName || matchCode || matchEmail || matchCard;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Danh sách Nhân viên</h1>
                    <p className="text-sm text-slate-500 mt-1">Quản lý hồ sơ nhân sự và phân bổ mã thẻ RFID</p>
                </div>

                <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Thêm nhân viên mới</span>
                </button>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo tên, email, mã NV hoặc mã thẻ RFID..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                    />
                </div>

                {/* Lọc theo Phòng ban */}
                <div className="w-full md:w-56">
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none text-slate-700"
                    >
                        <option value="">Tất cả phòng ban</option>
                        {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>

                {/* Lọc theo Trạng thái */}
                <div className="w-full md:w-44">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none text-slate-700"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="ACTIVE">Đang làm việc</option>
                        <option value="INACTIVE">Ngừng hoạt động</option>
                    </select>
                </div>

                {/* Reload */}
                <button
                    onClick={loadData}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    title="Tải lại danh sách"
                >
                    <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Table Data */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100 font-semibold">
                        <tr>
                            <th className="px-6 py-3.5">Mã NV</th>
                            <th className="px-6 py-3.5">Nhân viên</th>
                            <th className="px-6 py-3.5">Phòng ban & Vị trí</th>
                            <th className="px-6 py-3.5">Mã thẻ RFID</th>
                            <th className="px-6 py-3.5">Trạng thái</th>
                            <th className="px-6 py-3.5 text-right">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    Đang tải danh sách nhân viên...
                                </td>
                            </tr>
                        ) : filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    Không tìm thấy nhân viên nào phù hợp
                                </td>
                            </tr>
                        ) : (
                            filteredEmployees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-50/60 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-slate-600">
                                        {emp.employeeCode}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-slate-900">{emp.fullName}</div>
                                        <div className="text-xs text-slate-400">{emp.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-slate-700 font-medium">{emp.departmentName}</div>
                                        <div className="text-xs text-slate-400">{emp.jobTitle || 'Chưa đặt chức danh'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          {emp.cardCode}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {emp.employmentStatus === 'ACTIVE' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Đang làm việc
                        </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <XCircle className="w-3 h-3" /> Ngừng hoạt động
                        </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleOpenEdit(emp)}
                                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition"
                                            title="Chỉnh sửa nhân viên & mã thẻ"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            <EmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadData}
                initialData={editingEmployee}
                departments={departments}
            />
        </div>
    );
};