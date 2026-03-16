package com.apqp.main.project.controller;

import com.apqp.main.auth.security.UserPrincipal;
import com.apqp.main.project.dto.ProjectRequest;
import com.apqp.main.project.dto.ProjectResponse;
import com.apqp.main.project.entity.Project;
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
}
