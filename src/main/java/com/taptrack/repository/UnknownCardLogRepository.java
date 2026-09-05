package com.taptrack.repository;

import com.taptrack.entity.UnknownCardLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UnknownCardLogRepository extends JpaRepository<UnknownCardLog, Long> {
    @Query("SELECT u FROM UnknownCardLog u ORDER BY u.scanTime DESC")
    List<UnknownCardLog> findRecentLogs(Pageable pageable);
}