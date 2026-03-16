package com.apqp.main.bom.repository;

import com.apqp.main.bom.entity.BomHeader;
import com.apqp.main.bom.entity.BomLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BomRepository extends JpaRepository<BomHeader, Long> {

    Optional<BomHeader> findByProjectIdAndTopPartIdAndIsCurrentTrue(Long projectId, Long topPartId);

    List<BomHeader> findByProjectIdOrderByCreatedAtDesc(Long projectId);
}
