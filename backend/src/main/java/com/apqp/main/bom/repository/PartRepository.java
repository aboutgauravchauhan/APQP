package com.apqp.main.bom.repository;

import com.apqp.main.bom.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PartRepository extends JpaRepository<Part, Long> {

    List<Part> findByProjectIdAndIsActiveTrue(Long projectId);

    Optional<Part> findByProjectIdAndPartNo(Long projectId, String partNo);

    List<Part> findByProjectIdAndPartType(Long projectId, Part.PartType partType);

    @Query("""
        SELECT p FROM Part p
        WHERE p.projectId = :projectId
        AND p.partType IN ('ASSEMBLY', 'SUB_ASSEMBLY')
        AND p.isActive = true
        ORDER BY p.partType, p.partName
        """)
    List<Part> findAssembliesForProject(@Param("projectId") Long projectId);

    @Query("""
        SELECT DISTINCT bl.parentPartId FROM BomLine bl
        WHERE bl.childPartId = :partId AND bl.isActive = true
        """)
    List<Long> findWhereUsed(@Param("partId") Long partId);
}
