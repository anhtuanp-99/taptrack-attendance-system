package com.taptrack.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter @Setter
@ConfigurationProperties(prefix = "attendance")
public class AttendanceProperties {
    /** Số phút trễ cho phép chung toàn hệ thống. */
    private int gracePeriodMinutes = 5;
}