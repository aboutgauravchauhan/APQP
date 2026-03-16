package com.apqp.main.project.repository;

import com.apqp.main.project.entity.ProgramTeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProgramTeamMemberRepository extends JpaRepository<ProgramTeamMember, Long> {

    List<ProgramTeamMember> findByProjectId(Long projectId);

    Optional<ProgramTeamMember> findByProjectIdAndUserId(Long projectId, Long userId);

    void deleteByProjectIdAndUserId(Long projectId, Long userId);
}
