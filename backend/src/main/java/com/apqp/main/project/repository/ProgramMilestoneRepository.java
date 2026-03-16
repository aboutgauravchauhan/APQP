package com.apqp.main.project.repository;

import com.apqp.main.project.entity.ProgramMilestone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgramMilestoneRepository extends JpaRepository<ProgramMilestone, Long> {

    List<ProgramMilestone> findByProjectIdOrderBySequenceNoAsc(Long projectId);
}
