package com.taptrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class TapTrackApplication {
    public static void main(String[] args) {
        SpringApplication.run(TapTrackApplication.class, args);
    }
}