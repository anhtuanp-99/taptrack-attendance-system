package com.taptrack.repository;

import com.taptrack.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {
    Optional<Employee> findByCardCode(String cardCode);
    Optional<Employee> findByAccountId(Long accountId);
    boolean existsByEmployeeCode(String employeeCode);
    boolean existsByCardCode(String cardCode);
    boolean existsByCardCodeAndIdNot(String cardCode, Long id);
    boolean existsByDepartmentId(Long departmentId);
}