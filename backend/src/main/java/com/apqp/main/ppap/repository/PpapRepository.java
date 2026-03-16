package com.apqp.main.ppap.repository;

import com.apqp.main.ppap.entity.PpapPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PpapRepository extends JpaRepository<PpapPackage, Long> {

    List<PpapPackage> findByProjectId(Long projectId);

    List<PpapPackage> findByProjectIdAndPartId(Long projectId, Long partId);

    @Query("""
        SELECT COUNT(p) FROM PpapPackage p
        WHERE p.overallStatus NOT IN ('APPROVED')
        AND p.projectId IN (
            SELECT pr.id FROM Project pr WHERE pr.status = 'ACTIVE'
        )
        """)
    long countPendingPpaps();

    @Query("""
        SELECT COUNT(p) FROM PpapPackage p
        WHERE p.resubmissionRequired = true
        """)
    long countResubmissionRequired();
}
