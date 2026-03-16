package com.apqp.main.bom.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "bom_headers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BomHeader {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "top_part_id", nullable = false)
    private Long topPartId;

    @Column(name = "bom_revision", nullable = false)
    private String bomRevision = "1";

    @Column(name = "bom_type", nullable = false)
    private String bomType = "ENGINEERING";

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom = LocalDate.now();

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @Column(name = "is_current", nullable = false)
    private boolean isCurrent = true;

    @Column(name = "created_by", nullable = false, updatable = false)
    private Long createdBy;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED, CONDITIONALLY_APPROVED
    }
}
