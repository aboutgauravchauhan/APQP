package com.apqp.main.project.controller;

import com.apqp.main.auth.security.UserPrincipal;
import com.apqp.main.project.dto.ProjectRequest;
import com.apqp.main.project.dto.ProjectResponse;
import com.apqp.main.project.entity.*;
import com.apqp.main.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Projects", description = "Program / Project Management APIs")
@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @Operation(summary = "Create a new project/program")
    @PostMapping
    public ResponseEntity<ProjectResponse> create(
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.createProject(request, principal.getId()));
    }

    @Operation(summary = "Get all projects with pagination")
    @GetMapping
    public ResponseEntity<Page<ProjectResponse>> getAll(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(projectService.getProjects(pageable));
    }

    @Operation(summary = "Get project by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    @Operation(summary = "Update project details")
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @Operation(summary = "Update project status")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ProjectResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam Project.ProjectStatus status) {
        return ResponseEntity.ok(projectService.updateStatus(id, status));
    }

    @Operation(summary = "Update project risk level")
    @PatchMapping("/{id}/risk")
    public ResponseEntity<ProjectResponse> updateRisk(
            @PathVariable Long id,
            @RequestParam Project.RiskLevel riskLevel,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(projectService.updateRiskLevel(id, riskLevel, remarks));
    }

    // ---- CFT Team Members ----

    @Operation(summary = "Get team members for a project")
    @GetMapping("/{id}/team")
    public ResponseEntity<List<ProgramTeamMember>> getTeam(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getTeamMembers(id));
    }

    @Operation(summary = "Add a team member to a project")
    @PostMapping("/{id}/team")
    public ResponseEntity<ProgramTeamMember> addTeamMember(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String cftRole,
            @RequestParam(defaultValue = "false") boolean isProgramManager) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.addTeamMember(id, userId, cftRole, isProgramManager));
    }

    @Operation(summary = "Remove a team member from a project")
    @DeleteMapping("/{id}/team/{userId}")
    public ResponseEntity<Void> removeTeamMember(@PathVariable Long id, @PathVariable Long userId) {
        projectService.removeTeamMember(id, userId);
        return ResponseEntity.noContent().build();
    }

    // ---- Milestones ----

    @Operation(summary = "Get milestones for a project")
    @GetMapping("/{id}/milestones")
    public ResponseEntity<List<ProgramMilestone>> getMilestones(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getMilestones(id));
    }

    @Operation(summary = "Add a milestone to a project")
    @PostMapping("/{id}/milestones")
    public ResponseEntity<ProgramMilestone> addMilestone(
            @PathVariable Long id,
            @RequestBody ProgramMilestone milestone) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.addMilestone(id, milestone));
    }

    @Operation(summary = "Update a milestone")
    @PutMapping("/{id}/milestones/{milestoneId}")
    public ResponseEntity<ProgramMilestone> updateMilestone(
            @PathVariable Long id,
            @PathVariable Long milestoneId,
            @RequestBody ProgramMilestone milestone) {
        return ResponseEntity.ok(projectService.updateMilestone(milestoneId, milestone));
    }

    @Operation(summary = "Delete a milestone")
    @DeleteMapping("/{id}/milestones/{milestoneId}")
    public ResponseEntity<Void> deleteMilestone(
            @PathVariable Long id,
            @PathVariable Long milestoneId) {
        projectService.deleteMilestone(milestoneId);
        return ResponseEntity.noContent().build();
    }

    // ---- Customer Representatives ----

    @Operation(summary = "Get customer reps for a project")
    @GetMapping("/{id}/customer-reps")
    public ResponseEntity<List<ProgramCustomerRep>> getCustomerReps(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getCustomerReps(id));
    }

    @Operation(summary = "Add a customer rep to a project")
    @PostMapping("/{id}/customer-reps")
    public ResponseEntity<ProgramCustomerRep> addCustomerRep(
            @PathVariable Long id,
            @RequestParam Long contactId,
            @RequestParam(required = false) String repRole,
            @RequestParam(defaultValue = "false") boolean isPrimary) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.addCustomerRep(id, contactId, repRole, isPrimary));
    }

    @Operation(summary = "Remove a customer rep from a project")
    @DeleteMapping("/{id}/customer-reps/{contactId}")
    public ResponseEntity<Void> removeCustomerRep(
            @PathVariable Long id,
            @PathVariable Long contactId) {
        projectService.removeCustomerRep(id, contactId);
        return ResponseEntity.noContent().build();
    }
}
