package com.taptrack.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.time.*;

@Component
public class TimeProvider {

    private final Clock clock;
    private final ZoneId zone;

    // Thêm @Autowired vào đây để Spring biết cần sử dụng constructor này
    @Autowired
    public TimeProvider(@Value("${app.timezone:Asia/Ho_Chi_Minh}") String zoneId) {
        this.zone = ZoneId.of(zoneId);
        this.clock = Clock.system(zone);
    }

    /** Constructor cho unit test. */
    public TimeProvider(Clock clock) {
        this.clock = clock;
        this.zone = clock.getZone();
    }

    public LocalDateTime now()  { return LocalDateTime.now(clock); }
    public LocalDate today()    { return LocalDate.now(clock); }
    public ZoneId zone()        { return zone; }
}