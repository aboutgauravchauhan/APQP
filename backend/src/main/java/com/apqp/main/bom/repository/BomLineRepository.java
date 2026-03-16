package com.apqp.main.bom.repository;

import com.apqp.main.bom.entity.BomLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BomLineRepository extends JpaRepository<BomLine, Long> {

    List<BomLine> findByBomIdAndIsActiveTrueOrderByLevelNoAscSequenceNoAsc(Long bomId);

    List<BomLine> findByBomIdAndParentPartIdAndIsActiveTrue(Long bomId, Long parentPartId);

    @Query("""
        SELECT bl FROM BomLine bl
        WHERE bl.bomId = :bomId
        AND bl.levelNo = 1
        AND bl.isActive = true
        ORDER BY bl.sequenceNo ASC
        """)
    List<BomLine> findTopLevelItems(@Param("bomId") Long bomId);

    @Query("""
        SELECT COUNT(bl) FROM BomLine bl
        WHERE bl.bomId = :bomId AND bl.isActive = true
        """)
    long countActiveLines(@Param("bomId") Long bomId);
}
