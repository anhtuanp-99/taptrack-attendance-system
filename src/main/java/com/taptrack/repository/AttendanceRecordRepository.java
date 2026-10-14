package com.taptrack.repository;

import com.taptrack.entity.AttendanceRecord;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long>,
        JpaSpecificationExecutor<AttendanceRecord> {

    Optional<AttendanceRecord> findByEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);
    boolean existsByEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);

    Page<AttendanceRecord> findByEmployeeIdAndWorkDateBetween(
            Long employeeId, LocalDate from, LocalDate to, Pageable pageable);

    List<AttendanceRecord> findByWorkDate(LocalDate workDate);
    List<AttendanceRecord> findByEmployeeIdAndWorkDateBetween(
            Long employeeId, LocalDate from, LocalDate to);
}