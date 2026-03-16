package com.apqp.main.apqp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "apqp_task_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApqpTaskTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "phase_id", nullable = false)
    private Long phaseId;

    @Column(name = "task_code", nullable = false, unique = true)
    private String taskCode;

    @Column(name = "task_name", nullable = false)
    private String taskName;

    private String description;

    @Column(name = "default_dept_code")
    private String defaultDeptCode;

    @Column(name = "is_mandatory", nullable = false)
    private boolean isMandatory = true;

    @Column(name = "sla_days", nullable = false)
    private int slaDays = 14;

    @Column(name = "document_required", nullable = false)
    private boolean documentRequired = false;

    @Column(name = "document_type_name")
    private String documentTypeName;

    @Column(name = "dependency_codes")
    private String[] dependencyCodes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
