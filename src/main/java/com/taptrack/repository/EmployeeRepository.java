package com.taptrack.repository;

import com.taptrack.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    boolean existsByCardCode(String cardCode);

    boolean existsByEmployeeCode(String employeeCode);

    // Dùng để chặn xóa Department còn nhân viên (FR-1.2)
    boolean existsByDepartmentId(Long departmentId);
}