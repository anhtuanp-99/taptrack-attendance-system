package com.taptrack.service;

import com.taptrack.entity.UnknownCardLog;
import com.taptrack.repository.UnknownCardLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UnknownCardLogService {

    private final UnknownCardLogRepository unknownCardLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logUnknownCard(String cardCode, LocalDateTime scanTime) {
        unknownCardLogRepository.save(UnknownCardLog.builder()
                .cardCode(cardCode)
                .scanTime(scanTime)
                .build());
    }
}