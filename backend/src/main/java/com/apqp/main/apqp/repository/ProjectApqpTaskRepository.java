package com.apqp.main.apqp.repository;

import com.apqp.main.apqp.entity.ProjectApqpTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ProjectApqpTaskRepository extends JpaRepository<ProjectApqpTask, Long> {

    List<ProjectApqpTask> findByProjectIdOrderByPhaseIdAscTaskCodeAsc(Long projectId);

    List<ProjectApqpTask> findByProjectIdAndPhaseId(Long projectId, Long phaseId);

    List<ProjectApqpTask> findByOwnerUserIdAndStatusNot(Long userId, ProjectApqpTask.TaskStatus status);

    @Query("""
        SELECT t FROM ProjectApqpTask t
        WHERE t.projectId = :projectId
        AND t.phaseId = :phaseId
        AND t.status NOT IN ('COMPLETED', 'CANCELLED')
        AND (t.isMandatory = true OR :mandatoryOnly = false)
        """)
    List<ProjectApqpTask> findIncompleteTasksInPhase(
            @Param("projectId") Long projectId,
            @Param("phaseId") Long phaseId,
            @Param("mandatoryOnly") boolean mandatoryOnly);

    @Query("""
        SELECT COUNT(t) FROM ProjectApqpTask t
        WHERE t.projectId = :projectId
        AND t.phaseId = :phaseId
        AND t.status = 'COMPLETED'
        """)
    long countCompletedTasksInPhase(@Param("projectId") Long projectId, @Param("phaseId") Long phaseId);

    @Query("""
        SELECT COUNT(t) FROM ProjectApqpTask t
        WHERE t.projectId = :projectId
        AND t.phaseId = :phaseId
        """)
    long countTotalTasksInPhase(@Param("projectId") Long projectId, @Param("phaseId") Long phaseId);

    @Query("""
        SELECT t FROM ProjectApqpTask t
        WHERE t.plannedEnd < :today
        AND t.status NOT IN ('COMPLETED', 'CANCELLED')
        """)
    List<ProjectApqpTask> findOverdueTasks(@Param("today") LocalDate today);

    @Query("""
        SELECT t FROM ProjectApqpTask t
        WHERE t.projectId = :projectId
        AND t.plannedEnd BETWEEN :from AND :to
        AND t.status NOT IN ('COMPLETED', 'CANCELLED')
        ORDER BY t.plannedEnd ASC
        """)
    List<ProjectApqpTask> findUpcomingTasksForProject(
            @Param("projectId") Long projectId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
