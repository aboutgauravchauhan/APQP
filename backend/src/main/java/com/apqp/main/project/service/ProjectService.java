package com.apqp.main.project.service;

import com.apqp.main.apqp.service.ApqpTaskGeneratorService;
import com.apqp.main.auth.repository.UserRepository;
import com.apqp.main.common.exception.BusinessRuleException;
import com.apqp.main.common.exception.ResourceNotFoundException;
import com.apqp.main.project.dto.ProjectRequest;
import com.apqp.main.project.dto.ProjectResponse;
import com.apqp.main.project.entity.Project;
import com.apqp.main.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ApqpTaskGeneratorService taskGeneratorService;

    private final AtomicInteger sequence = new AtomicInteger(1);

    @Transactional
    public ProjectResponse createProject(ProjectRequest request, Long createdBy) {
        String munNo = generateMunNo();
        String projectCode = generateProjectCode(request.customerId());

        Project project = Project.builder()
                .munNo(munNo)
                .projectCode(projectCode)
                .projectName(request.projectName())
                .customerId(request.customerId())
                .plantId(request.plantId())
                .vehicleName(request.vehicleName())
                .vehiclePlatform(request.vehiclePlatform())
                .modelName(request.modelName())
                .customerPartNo(request.customerPartNo())
                .internalPartNo(request.internalPartNo())
                .sopDate(request.sopDate())
                .sampleDate(request.sampleDate())
                .sosDate(request.sosDate())
                .annualVolume(request.annualVolume())
                .dailyVolume(request.dailyVolume())
                .projectType(request.projectType() != null ? request.projectType() : Project.ProjectType.NEW_DEVELOPMENT)
                .status(Project.ProjectStatus.DRAFT)
                .riskLevel(Project.RiskLevel.GREEN)
                .projectManagerId(request.projectManagerId())
                .plantHeadId(request.plantHeadId())
                .qualityHeadId(request.qualityHeadId())
                .createdBy(createdBy)
                .build();

        project = projectRepository.save(project);

        // Auto-generate APQP tasks from templates
        taskGeneratorService.generateTasksForProject(project.getId(), createdBy);

        log.info("Created project: {} with MUN: {}", project.getProjectName(), project.getMunNo());
        return mapToResponse(project);
    }

    @Transactional(readOnly = true)
    public Page<ProjectResponse> getProjects(Pageable pageable) {
        return projectRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long id) {
        return mapToResponse(findById(id));
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = findById(id);

        if (project.getStatus() == Project.ProjectStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot update a cancelled project");
        }

        project.setProjectName(request.projectName());
        project.setVehicleName(request.vehicleName());
        project.setVehiclePlatform(request.vehiclePlatform());
        project.setModelName(request.modelName());
        project.setSopDate(request.sopDate());
        project.setSampleDate(request.sampleDate());
        project.setSosDate(request.sosDate());
        project.setAnnualVolume(request.annualVolume());
        project.setDailyVolume(request.dailyVolume());
        project.setProjectManagerId(request.projectManagerId());
        project.setPlantHeadId(request.plantHeadId());
        project.setQualityHeadId(request.qualityHeadId());

        return mapToResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse updateStatus(Long id, Project.ProjectStatus newStatus) {
        Project project = findById(id);

        validateStatusTransition(project.getStatus(), newStatus);
        project.setStatus(newStatus);

        return mapToResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse updateRiskLevel(Long id, Project.RiskLevel riskLevel, String remarks) {
        Project project = findById(id);
        project.setRiskLevel(riskLevel);
        project.setRiskRemarks(remarks);
        return mapToResponse(projectRepository.save(project));
    }

    private Project findById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
    }

    private String generateMunNo() {
        int year = Year.now().getValue() % 100;
        int seq = sequence.getAndIncrement();
        return String.format("MUN-%02d-%04d", year, seq);
    }

    private String generateProjectCode(Long customerId) {
        int year = Year.now().getValue() % 100;
        long count = projectRepository.count() + 1;
        return String.format("PRJ-%02d-C%d-%04d", year, customerId, count);
    }

    private void validateStatusTransition(Project.ProjectStatus current, Project.ProjectStatus next) {
        // Basic state machine validation
        if (current == Project.ProjectStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot change status of a cancelled project");
        }
        if (current == Project.ProjectStatus.COMPLETED && next == Project.ProjectStatus.DRAFT) {
            throw new BusinessRuleException("Cannot revert completed project to draft");
        }
    }

    private ProjectResponse mapToResponse(Project p) {
        return new ProjectResponse(
                p.getId(), p.getMunNo(), p.getProjectCode(), p.getProjectName(),
                p.getCustomerId(), null, p.getPlantId(), null,
                p.getVehicleName(), p.getVehiclePlatform(), p.getModelName(),
                p.getCustomerPartNo(), p.getInternalPartNo(),
                p.getSopDate(), p.getSampleDate(),
                p.getAnnualVolume(), p.getDailyVolume(),
                p.getProjectType(), p.getStatus(), p.getRiskLevel(), p.getRiskRemarks(),
                p.getProjectManagerId(), null,
                p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
