package com.apqp.main.apqp.service;

import com.apqp.main.apqp.entity.ApqpTaskTemplate;
import com.apqp.main.apqp.entity.ProjectApqpTask;
import com.apqp.main.apqp.repository.ApqpTaskTemplateRepository;
import com.apqp.main.apqp.repository.ProjectApqpTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApqpTaskGeneratorService {

    private final ApqpTaskTemplateRepository templateRepository;
    private final ProjectApqpTaskRepository taskRepository;

    @Transactional
    public List<ProjectApqpTask> generateTasksForProject(Long projectId, Long createdBy) {
        List<ApqpTaskTemplate> templates = templateRepository.findAllByOrderByPhaseIdAscTaskCodeAsc();

        LocalDate today = LocalDate.now();

        List<ProjectApqpTask> tasks = templates.stream()
                .map(template -> ProjectApqpTask.builder()
                        .projectId(projectId)
                        .phaseId(template.getPhaseId())
                        .templateTaskId(template.getId())
                        .taskCode(template.getTaskCode())
                        .taskName(template.getTaskName())
                        .status(ProjectApqpTask.TaskStatus.NOT_STARTED)
                        .priority(ProjectApqpTask.PriorityLevel.MEDIUM)
                        .percentComplete(0)
                        .riskLevel(ProjectApqpTask.RiskLevel.GREEN)
                        .escalationLevel(0)
                        .isBlocking(false)
                        .plannedStart(today)
                        .plannedEnd(today.plusDays(template.getSlaDays()))
                        .createdBy(createdBy)
                        .build())
                .collect(Collectors.toList());

        List<ProjectApqpTask> saved = taskRepository.saveAll(tasks);
        log.info("Generated {} APQP tasks for project {}", saved.size(), projectId);
        return saved;
    }

    @Transactional
    public void reopenTasksForEcn(Long projectId, Long phaseId, Long createdBy) {
        List<ProjectApqpTask> tasks = taskRepository.findByProjectIdAndPhaseId(projectId, phaseId);
        tasks.stream()
                .filter(t -> t.getStatus() == ProjectApqpTask.TaskStatus.COMPLETED)
                .forEach(t -> {
                    t.setStatus(ProjectApqpTask.TaskStatus.NOT_STARTED);
                    t.setPercentComplete(0);
                    t.setRemarks("Reopened due to Engineering Change. Previous completion cleared.");
                });
        taskRepository.saveAll(tasks);
        log.info("Reopened {} tasks in phase {} for project {} due to ECN", tasks.size(), phaseId, projectId);
    }
}
