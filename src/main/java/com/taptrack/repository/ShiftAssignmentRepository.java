package com.taptrack.repository;

import com.taptrack.entity.ShiftAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Long> {
    Optional<ShiftAssignment> findByEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);
    boolean existsByEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);
    boolean existsByShiftTemplateId(Long shiftTemplateId);
    List<ShiftAssignment> findByEmployeeIdAndWorkDateBetween(Long employeeId, LocalDate from, LocalDate to);
    List<ShiftAssignment> findByWorkDate(LocalDate workDate);
}