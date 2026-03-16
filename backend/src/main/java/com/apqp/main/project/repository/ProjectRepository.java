package com.apqp.main.project.repository;

import com.apqp.main.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {

    Optional<Project> findByMunNo(String munNo);

    Optional<Project> findByProjectCode(String projectCode);

    boolean existsByMunNo(String munNo);

    boolean existsByProjectCode(String projectCode);

    List<Project> findByCustomerId(Long customerId);

    List<Project> findByStatus(Project.ProjectStatus status);

    @Query("""
        SELECT p FROM Project p
        WHERE p.status = 'ACTIVE'
        AND p.sopDate IS NOT NULL
        ORDER BY p.sopDate ASC
        """)
    List<Project> findActiveProjectsOrderBySop();

    @Query("""
        SELECT COUNT(p) FROM Project p WHERE p.status = :status
        """)
    long countByStatus(@Param("status") Project.ProjectStatus status);

    @Query("""
        SELECT COUNT(p) FROM Project p
        WHERE p.riskLevel = 'RED' AND p.status = 'ACTIVE'
        """)
    long countRedRiskActiveProjects();

    @Query("SELECT COUNT(p) FROM Project p WHERE p.projectCode LIKE CONCAT(:prefix, '%')")
    long countByProjectCodeStartsWith(@Param("prefix") String prefix);
}
