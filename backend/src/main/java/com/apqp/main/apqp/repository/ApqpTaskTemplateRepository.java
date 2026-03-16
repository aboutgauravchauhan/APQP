package com.apqp.main.apqp.repository;

import com.apqp.main.apqp.entity.ApqpTaskTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApqpTaskTemplateRepository extends JpaRepository<ApqpTaskTemplate, Long> {
    List<ApqpTaskTemplate> findByPhaseIdOrderByTaskCode(Long phaseId);
    List<ApqpTaskTemplate> findAllByOrderByPhaseIdAscTaskCodeAsc();
}
