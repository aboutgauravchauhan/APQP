package com.apqp.main.bom.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "parts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "part_no", nullable = false)
    private String partNo;

    @Column(name = "part_name", nullable = false)
    private String partName;

    @Enumerated(EnumType.STRING)
    @Column(name = "part_type", nullable = false)
    private PartType partType;

    @Column(name = "customer_drawing_no")
    private String customerDrawingNo;

    @Column(name = "internal_drawing_no")
    private String internalDrawingNo;

    @Column(name = "drawing_revision", nullable = false)
    private String drawingRevision = "A";

    @Column(name = "material_spec")
    private String materialSpec;

    @Column(name = "material_grade")
    private String materialGrade;

    @Column(name = "surface_treatment")
    private String surfaceTreatment;

    @Column(name = "weight_kg", precision = 10, scale = 4)
    private BigDecimal weightKg;

    @Column(nullable = false)
    private String uom = "NOS";

    private String criticality;

    @Enumerated(EnumType.STRING)
    @Column(name = "sourcing_type", nullable = false)
    private SourcingType sourcingType = SourcingType.INHOUSE;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_by", nullable = false, updatable = false)
    private Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum PartType {
        ASSEMBLY, SUB_ASSEMBLY, COMPONENT, RAW_MATERIAL, BOUGHT_OUT, SERVICE
    }

    public enum SourcingType {
        INHOUSE, BOUGHT_OUT, SUBCONTRACT, CONSIGNMENT
    }
}
