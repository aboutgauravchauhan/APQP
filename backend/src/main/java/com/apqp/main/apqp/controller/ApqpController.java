package com.apqp.main.apqp.controller;

import com.apqp.main.apqp.entity.ApqpPhase;
import com.apqp.main.apqp.entity.ProjectApqpTask;
import com.apqp.main.apqp.repository.ApqpPhaseRepository;
import com.apqp.main.apqp.service.ApqpTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "APQP", description = "APQP Workflow Management APIs")
@RestController
@RequiredArgsConstructor
public class ApqpController {

    private final ApqpTaskService taskService;
    private final ApqpPhaseRepository phaseRepository;

    @Operation(summary = "Get all APQP phases")
    @GetMapping("/apqp/phases")
    public ResponseEntity<List<ApqpPhase>> getPhases() {
        return ResponseEntity.ok(phaseRepository.findAllByOrderBySequenceNoAsc());
    }

    @Operation(summary = "Get all APQP tasks for a project")
    @GetMapping("/projects/{projectId}/apqp/tasks")
    public ResponseEntity<List<ProjectApqpTask>> getProjectTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    @Operation(summary = "Get phase-wise progress summary for a project")
    @GetMapping("/projects/{projectId}/apqp/progress")
    public ResponseEntity<Map<Long, ApqpTaskService.PhaseProgress>> getProgress(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getPhaseProgress(projectId));
    }

    @Operation(summary = "Update an APQP task")
    @PutMapping("/apqp/tasks/{taskId}")
    public ResponseEntity<ProjectApqpTask> updateTask(
            @PathVariable Long taskId,
            @RequestBody ApqpTaskService.TaskUpdateRequest request) {
        return ResponseEntity.ok(taskService.updateTask(taskId, request));
    }
}
