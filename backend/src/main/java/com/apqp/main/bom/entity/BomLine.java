package com.apqp.main.bom.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "bom_lines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BomLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bom_id", nullable = false)
    private Long bomId;

    @Column(name = "parent_part_id", nullable = false)
    private Long parentPartId;

    @Column(name = "child_part_id", nullable = false)
    private Long childPartId;

    @Column(name = "level_no", nullable = false)
    private Integer levelNo = 1;

    @Column(name = "sequence_no", nullable = false)
    private Integer sequenceNo = 10;

    @Column(nullable = false, precision = 12, scale = 4)
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(nullable = false)
    private String uom = "NOS";

    @Column(name = "scrap_percent", precision = 5, scale = 2)
    private BigDecimal scrapPercent = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "sourcing_type", nullable = false)
    private Part.SourcingType sourcingType = Part.SourcingType.INHOUSE;

    @Column(name = "preferred_vendor_id")
    private Long preferredVendorId;

    @Column(name = "find_no")
    private String findNo;

    private String remarks;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
