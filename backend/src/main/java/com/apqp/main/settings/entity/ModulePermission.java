package com.apqp.main.settings.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "module_permissions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"role_code", "module"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModulePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_code", nullable = false)
    private String roleCode;

    @Column(name = "module", nullable = false)
    private String module;

    @Column(name = "can_view", nullable = false)
    private boolean canView = true;

    @Column(name = "can_create", nullable = false)
    private boolean canCreate = false;

    @Column(name = "can_edit", nullable = false)
    private boolean canEdit = false;

    @Column(name = "can_delete", nullable = false)
    private boolean canDelete = false;
}
