package com.apqp.main.ecn.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "ecn_impacted_objects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EcnImpactedObject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ecn_id", nullable = false)
    private Long ecnId;

    @Enumerated(EnumType.STRING)
    @Column(name = "object_type", nullable = false)
    private ObjectType objectType;

    @Column(name = "object_id", nullable = false)
    private Long objectId;

    @Column(name = "object_ref")
    private String objectRef;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "action_required", columnDefinition = "TEXT")
    private String actionRequired;

    @Column(name = "is_resolved", nullable = false)
    private boolean isResolved = false;

    @Column(name = "resolved_by")
    private Long resolvedBy;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public enum ObjectType {
        PART, BOM, PROCESS, TOOLING, PPAP, VENDOR, DOCUMENT, MANPOWER
    }
}
