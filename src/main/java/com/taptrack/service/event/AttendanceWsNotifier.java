package com.taptrack.service.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class AttendanceWsNotifier {

    private final SimpMessagingTemplate ws;

    /** Chỉ gửi sau khi transaction commit thành công — lỗi WS không ảnh hưởng DB. */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onAttendanceChanged(AttendanceChangedEvent event) {
        try {
            ws.convertAndSend("/topic/attendance", event.message());
        } catch (Exception ex) {
            log.warn("Gửi WebSocket thất bại: {}", ex.getMessage());
        }
    }
}