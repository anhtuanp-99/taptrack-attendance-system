package com.taptrack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "unknown_card_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnknownCardLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "card_code", nullable = false, length = 50)
    private String cardCode;

    @Column(name = "scan_time", nullable = false)
    private LocalDateTime scanTime;
}