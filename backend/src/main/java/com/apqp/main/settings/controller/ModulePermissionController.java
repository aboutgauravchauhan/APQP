package com.apqp.main.settings.controller;

import com.apqp.main.common.exception.ResourceNotFoundException;
import com.apqp.main.settings.entity.ModulePermission;
import com.apqp.main.settings.repository.ModulePermissionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Module Permissions", description = "Role-based module access control")
@RestController
@RequestMapping("/module-permissions")
@RequiredArgsConstructor
public class ModulePermissionController {

    private final ModulePermissionRepository permissionRepository;

    @Operation(summary = "Get all module permissions")
    @GetMapping
    public ResponseEntity<List<ModulePermission>> getAll() {
        return ResponseEntity.ok(permissionRepository.findAll());
    }

    @Operation(summary = "Get permissions for a specific role")
    @GetMapping("/role/{roleCode}")
    public ResponseEntity<List<ModulePermission>> getByRole(@PathVariable String roleCode) {
        return ResponseEntity.ok(permissionRepository.findByRoleCode(roleCode));
    }

    @Operation(summary = "Update a permission entry")
    @PutMapping("/{id}")
    public ResponseEntity<ModulePermission> update(
            @PathVariable Long id,
            @RequestBody ModulePermission updated) {
        ModulePermission perm = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ModulePermission", id));
        perm.setCanView(updated.isCanView());
        perm.setCanCreate(updated.isCanCreate());
        perm.setCanEdit(updated.isCanEdit());
        perm.setCanDelete(updated.isCanDelete());
        return ResponseEntity.ok(permissionRepository.save(perm));
    }
}
