package com.taptrack.service;

import com.taptrack.entity.UnknownCardLog;
import com.taptrack.repository.UnknownCardLogRepository;
import com.taptrack.util.TimeProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** Ghi log thẻ lạ trong transaction riêng, không bị rollback theo transaction gọi nó. */
@Service
@RequiredArgsConstructor
public class UnknownCardLogService {

    private final UnknownCardLogRepository repo;
    private final TimeProvider time;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String cardCode) {
        repo.save(UnknownCardLog.builder()
                .cardCode(cardCode)
                .scanTime(time.now())
                .build());
    }
}