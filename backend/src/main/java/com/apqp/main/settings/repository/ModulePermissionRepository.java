package com.apqp.main.settings.repository;

import com.apqp.main.settings.entity.ModulePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModulePermissionRepository extends JpaRepository<ModulePermission, Long> {

    List<ModulePermission> findByRoleCode(String roleCode);

    List<ModulePermission> findByRoleCodeAndModule(String roleCode, String module);
}
