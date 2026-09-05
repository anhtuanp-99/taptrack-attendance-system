package com.taptrack.repository;

import com.taptrack.entity.ShiftAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Long> {
    Optional<ShiftAssignment> findByEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);
    List<ShiftAssignment> findByEmployeeIdAndWorkDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);
    boolean existsByShiftTemplateId(Long shiftTemplateId);
    void deleteByEmployeeId(Long employeeId);
}