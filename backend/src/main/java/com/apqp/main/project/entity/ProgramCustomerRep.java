package com.apqp.main.project.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "program_customer_reps",
       uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "contact_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramCustomerRep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "contact_id", nullable = false)
    private Long contactId;

    @Column(name = "rep_role")
    private String repRole;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
