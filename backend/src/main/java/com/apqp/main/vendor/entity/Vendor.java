package com.apqp.main.vendor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "vendors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vendor_code", nullable = false, unique = true)
    private String vendorCode;

    @Column(name = "vendor_name", nullable = false)
    private String vendorName;

    @Column(name = "vendor_type", nullable = false)
    private String vendorType;

    private String location;
    private String country;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "gst_no")
    private String gstNo;

    @Column(name = "pan_no")
    private String panNo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VendorStatus status = VendorStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.NOT_EVALUATED;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "is_tier2_visible", nullable = false)
    private boolean isTier2Visible = false;

    @Column(name = "created_by", nullable = false, updatable = false)
    private Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum VendorStatus {
        ACTIVE, INACTIVE, BLACKLISTED, UNDER_DEVELOPMENT
    }

    public enum ApprovalStatus {
        NOT_EVALUATED, APPROVED, CONDITIONAL, REJECTED
    }
}
