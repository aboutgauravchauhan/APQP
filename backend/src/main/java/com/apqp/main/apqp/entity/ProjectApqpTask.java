package com.apqp.main.apqp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "project_apqp_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectApqpTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "part_id")
    private Long partId;

    @Column(name = "phase_id", nullable = false)
    private Long phaseId;

    @Column(name = "template_task_id")
    private Long templateTaskId;

    @Column(name = "task_code", nullable = false)
    private String taskCode;

    @Column(name = "task_name", nullable = false)
    private String taskName;

    @Column(name = "owner_user_id")
    private Long ownerUserId;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "planned_start")
    private LocalDate plannedStart;

    @Column(name = "planned_end")
    private LocalDate plannedEnd;

    @Column(name = "actual_start")
    private LocalDate actualStart;

    @Column(name = "actual_end")
    private LocalDate actualEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.NOT_STARTED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PriorityLevel priority = PriorityLevel.MEDIUM;

    @Column(name = "percent_complete", nullable = false)
    private Integer percentComplete = 0;

    @Column(name = "dependency_task_id")
    private Long dependencyTaskId;

    @Column(name = "is_blocking", nullable = false)
    private boolean isBlocking = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel = RiskLevel.GREEN;

    @Column(name = "escalation_level", nullable = false)
    private Integer escalationLevel = 0;

    private String remarks;

    @Column(name = "created_by", nullable = false, updatable = false)
    private Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum TaskStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED, OVERDUE
    }

    public enum PriorityLevel {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum RiskLevel {
        GREEN, AMBER, RED
    }
}
