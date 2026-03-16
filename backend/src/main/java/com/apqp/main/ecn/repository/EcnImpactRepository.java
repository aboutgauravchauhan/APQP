package com.apqp.main.ecn.repository;

import com.apqp.main.ecn.entity.EcnImpactedObject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EcnImpactRepository extends JpaRepository<EcnImpactedObject, Long> {
    List<EcnImpactedObject> findByEcnId(Long ecnId);
    List<EcnImpactedObject> findByEcnIdAndIsResolvedFalse(Long ecnId);
}
