package com.apqp.main.apqp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "apqp_phases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApqpPhase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "phase_code", nullable = false, unique = true)
    private String phaseCode;

    @Column(name = "phase_name", nullable = false)
    private String phaseName;

    @Column(name = "sequence_no", nullable = false)
    private Integer sequenceNo;

    private String description;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
