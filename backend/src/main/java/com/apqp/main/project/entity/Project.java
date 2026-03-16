package com.apqp.main.project.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mun_no", nullable = false, unique = true)
    private String munNo;

    @Column(name = "project_code", nullable = false, unique = true)
    private String projectCode;

    @Column(name = "project_name", nullable = false)
    private String projectName;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "plant_id", nullable = false)
    private Long plantId;

    @Column(name = "vehicle_name")
    private String vehicleName;

    @Column(name = "vehicle_platform")
    private String vehiclePlatform;

    @Column(name = "model_name")
    private String modelName;

    @Column(name = "customer_part_no")
    private String customerPartNo;

    @Column(name = "internal_part_no")
    private String internalPartNo;

    @Column(name = "sop_date")
    private LocalDate sopDate;

    @Column(name = "sample_date")
    private LocalDate sampleDate;

    @Column(name = "sos_date")
    private LocalDate sosDate;

    @Column(name = "annual_volume")
    private Integer annualVolume;

    @Column(name = "daily_volume")
    private Integer dailyVolume;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_type", nullable = false)
    private ProjectType projectType = ProjectType.NEW_DEVELOPMENT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status = ProjectStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel = RiskLevel.GREEN;

    @Column(name = "risk_remarks")
    private String riskRemarks;

    @Column(name = "project_manager_id")
    private Long projectManagerId;

    @Column(name = "plant_head_id")
    private Long plantHeadId;

    @Column(name = "quality_head_id")
    private Long qualityHeadId;

    @Column(name = "created_by", nullable = false, updatable = false)
    private Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum ProjectType {
        NEW_DEVELOPMENT, RESOURCING, ENGINEERING_CHANGE, CAPACITY_EXPANSION
    }

    public enum ProjectStatus {
        DRAFT, ACTIVE, ON_HOLD, COMPLETED, CANCELLED
    }

    public enum RiskLevel {
        GREEN, AMBER, RED
    }
}
