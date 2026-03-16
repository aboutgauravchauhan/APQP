package com.apqp.main.apqp.service;

import com.apqp.main.apqp.entity.ProjectApqpTask;
import com.apqp.main.apqp.repository.ProjectApqpTaskRepository;
import com.apqp.main.common.exception.BusinessRuleException;
import com.apqp.main.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApqpTaskService {

    private final ProjectApqpTaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<ProjectApqpTask> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectIdOrderByPhaseIdAscTaskCodeAsc(projectId);
    }

    @Transactional(readOnly = true)
    public Map<Long, PhaseProgress> getPhaseProgress(Long projectId) {
        List<ProjectApqpTask> tasks = taskRepository.findByProjectIdOrderByPhaseIdAscTaskCodeAsc(projectId);

        return tasks.stream().collect(Collectors.groupingBy(
                ProjectApqpTask::getPhaseId,
                Collectors.collectingAndThen(Collectors.toList(), taskList -> {
                    long total = taskList.size();
                    long completed = taskList.stream()
                            .filter(t -> t.getStatus() == ProjectApqpTask.TaskStatus.COMPLETED)
                            .count();
                    long overdue = taskList.stream()
                            .filter(t -> t.getPlannedEnd() != null
                                    && t.getPlannedEnd().isBefore(LocalDate.now())
                                    && t.getStatus() != ProjectApqpTask.TaskStatus.COMPLETED)
                            .count();
                    return new PhaseProgress(total, completed, overdue,
                            total > 0 ? (int) ((completed * 100) / total) : 0);
                })
        ));
    }

    @Transactional
    public ProjectApqpTask updateTask(Long taskId, TaskUpdateRequest request) {
        ProjectApqpTask task = findById(taskId);

        // Validate completion - check dependency is complete first
        if (request.status() == ProjectApqpTask.TaskStatus.COMPLETED
                && task.getDependencyTaskId() != null) {
            ProjectApqpTask dependency = findById(task.getDependencyTaskId());
            if (dependency.getStatus() != ProjectApqpTask.TaskStatus.COMPLETED) {
                throw new BusinessRuleException(
                        "Cannot complete task. Dependency task '" + dependency.getTaskName() + "' is not yet completed.");
            }
        }

        task.setStatus(request.status());
        task.setPercentComplete(request.percentComplete());
        task.setOwnerUserId(request.ownerUserId());
        task.setPlannedStart(request.plannedStart());
        task.setPlannedEnd(request.plannedEnd());
        task.setRemarks(request.remarks());
        task.setPriority(request.priority());

        if (request.status() == ProjectApqpTask.TaskStatus.IN_PROGRESS && task.getActualStart() == null) {
            task.setActualStart(LocalDate.now());
        }
        if (request.status() == ProjectApqpTask.TaskStatus.COMPLETED) {
            task.setActualEnd(LocalDate.now());
            task.setPercentComplete(100);
        }

        return taskRepository.save(task);
    }

    @Transactional
    public void checkAndMarkOverdueTasks() {
        List<ProjectApqpTask> overdue = taskRepository.findOverdueTasks(LocalDate.now());
        overdue.forEach(t -> {
            t.setStatus(ProjectApqpTask.TaskStatus.OVERDUE);
            t.setRiskLevel(ProjectApqpTask.RiskLevel.RED);
        });
        taskRepository.saveAll(overdue);
        log.info("Marked {} tasks as overdue", overdue.size());
    }

    private ProjectApqpTask findById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("APQP Task", id));
    }

    public record PhaseProgress(long total, long completed, long overdue, int completionPercent) {}

    public record TaskUpdateRequest(
            ProjectApqpTask.TaskStatus status,
            Integer percentComplete,
            Long ownerUserId,
            LocalDate plannedStart,
            LocalDate plannedEnd,
            String remarks,
            ProjectApqpTask.PriorityLevel priority
    ) {}
}
