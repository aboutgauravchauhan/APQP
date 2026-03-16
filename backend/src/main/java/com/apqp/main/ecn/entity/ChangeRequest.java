package com.apqp.main.ecn.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "change_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "part_id")
    private Long partId;

    @Column(name = "ecn_no", nullable = false, unique = true)
    private String ecnNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "ecn_type", nullable = false)
    private EcnType ecnType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EcnSeverity severity = EcnSeverity.MODERATE;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "impact_cost", precision = 15, scale = 2)
    private BigDecimal impactCost;

    @Column(name = "impact_timeline_days")
    private Integer impactTimelineDays;

    @Column(name = "impact_quality", columnDefinition = "TEXT")
    private String impactQuality;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EcnStatus status = EcnStatus.DRAFT;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "old_revision")
    private String oldRevision;

    @Column(name = "new_revision")
    private String newRevision;

    @Column(name = "requested_by", nullable = false, updatable = false)
    private Long requestedBy;

    @Column(name = "requested_at", nullable = false, updatable = false)
    private Instant requestedAt = Instant.now();

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "implemented_by")
    private Long implementedBy;

    @Column(name = "implemented_at")
    private Instant implementedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum EcnType {
        DESIGN_CHANGE, PROCESS_CHANGE, MATERIAL_CHANGE, VENDOR_CHANGE,
        TOOLING_CHANGE, COST_REDUCTION, QUALITY_IMPROVEMENT
    }

    public enum EcnSeverity {
        MINOR, MODERATE, MAJOR
    }

    public enum EcnStatus {
        DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, IMPLEMENTED, CLOSED
    }
}
