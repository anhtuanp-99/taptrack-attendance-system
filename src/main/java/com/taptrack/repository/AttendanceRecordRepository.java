package com.taptrack.repository;

import com.taptrack.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    Optional<AttendanceRecord> findByEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);
    boolean existsByEmployeeId(Long employeeId);
    boolean existsByEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);
    List<AttendanceRecord> findByWorkDate(LocalDate workDate);
}