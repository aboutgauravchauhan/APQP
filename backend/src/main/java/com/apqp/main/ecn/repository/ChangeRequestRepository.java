package com.apqp.main.ecn.repository;

import com.apqp.main.ecn.entity.ChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, Long> {

    List<ChangeRequest> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<ChangeRequest> findByPartIdAndStatusNot(Long partId, ChangeRequest.EcnStatus status);

    @Query("SELECT COUNT(cr) FROM ChangeRequest cr WHERE cr.status NOT IN ('CLOSED', 'REJECTED')")
    long countOpenEcns();

    @Query("""
        SELECT cr FROM ChangeRequest cr
        WHERE cr.projectId = :projectId
        AND cr.status NOT IN ('CLOSED', 'REJECTED')
        ORDER BY cr.severity DESC, cr.createdAt DESC
        """)
    List<ChangeRequest> findActiveEcnsForProject(@Param("projectId") Long projectId);

    boolean existsByEcnNo(String ecnNo);
}
