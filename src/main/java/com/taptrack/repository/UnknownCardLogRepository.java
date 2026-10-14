package com.taptrack.repository;

import com.taptrack.entity.UnknownCardLog;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;

public interface UnknownCardLogRepository extends JpaRepository<UnknownCardLog, Long> {
    Page<UnknownCardLog> findByScanTimeBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);
}