package com.apqp.main.ppap.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "ppap_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PpapPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "part_id", nullable = false)
    private Long partId;

    @Column(name = "vendor_id")
    private Long vendorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "ppap_level", nullable = false)
    private PpapLevel ppapLevel = PpapLevel.LEVEL_3;

    @Column(name = "submission_date")
    private LocalDate submissionDate;

    @Column(name = "customer_submission_date")
    private LocalDate customerSubmissionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "psw_status", nullable = false)
    private PpapStatus pswStatus = PpapStatus.NOT_STARTED;

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_status", nullable = false)
    private PpapStatus overallStatus = PpapStatus.NOT_STARTED;

    @Column(name = "resubmission_required", nullable = false)
    private boolean resubmissionRequired = false;

    @Column(name = "resubmission_reason", columnDefinition = "TEXT")
    private String resubmissionReason;

    @Column(name = "customer_dri")
    private String customerDri;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "created_by", nullable = false, updatable = false)
    private Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum PpapLevel {
        LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5
    }

    public enum PpapStatus {
        NOT_STARTED, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED, RESUBMIT_REQUIRED
    }
}
