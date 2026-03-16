package com.apqp.main.apqp.repository;

import com.apqp.main.apqp.entity.ApqpPhase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApqpPhaseRepository extends JpaRepository<ApqpPhase, Long> {
    List<ApqpPhase> findAllByOrderBySequenceNoAsc();
}
