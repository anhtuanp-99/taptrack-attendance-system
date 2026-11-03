package com.taptrack.service;

import com.taptrack.dto.response.UnknownCardResponse;
import com.taptrack.entity.UnknownCardLog;
import com.taptrack.repository.UnknownCardLogRepository;
import com.taptrack.util.TimeProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UnknownCardLogService {

    private final UnknownCardLogRepository repo;
    private final TimeProvider time;
    private final SimpMessagingTemplate messagingTemplate; // <-- Tiêm thêm bean này

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String cardCode) {
        var saved = repo.save(UnknownCardLog.builder()
                .cardCode(cardCode)
                .scanTime(time.now())
                .build());

        // Bắn WebSocket thông báo thẻ lạ tới Admin Dashboard
        messagingTemplate.convertAndSend(
                "/topic/attendance/unknown",
                new UnknownCardResponse(saved.getId(), saved.getCardCode(), saved.getScanTime())
        );
    }
}