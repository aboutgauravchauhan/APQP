package com.apqp.main.project.service;

import com.apqp.main.apqp.service.ApqpTaskGeneratorService;
import com.apqp.main.auth.repository.UserRepository;
import com.apqp.main.common.exception.BusinessRuleException;
import com.apqp.main.common.exception.ResourceNotFoundException;
import com.apqp.main.customer.entity.Customer;
import com.apqp.main.customer.repository.CustomerRepository;
import com.apqp.main.project.dto.ProjectRequest;
import com.apqp.main.project.dto.ProjectResponse;
import com.apqp.main.project.entity.*;
import com.apqp.main.project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ApqpTaskGeneratorService taskGeneratorService;
    private final ProgramTeamMemberRepository teamMemberRepository;
    private final ProgramMilestoneRepository milestoneRepository;
    private final ProgramCustomerRepRepository customerRepRepository;

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

        // Seed default milestones from SOP/SOS/Sample dates
        seedDefaultMilestones(project);

        log.info("Created project: {} with code: {}", project.getProjectName(), project.getProjectCode());
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

    // ---- CFT Team Members ----

    @Transactional(readOnly = true)
    public List<ProgramTeamMember> getTeamMembers(Long projectId) {
        findById(projectId);
        return teamMemberRepository.findByProjectId(projectId);
    }

    @Transactional
    public ProgramTeamMember addTeamMember(Long projectId, Long userId, String cftRole, boolean isProgramManager) {
        findById(projectId);
        if (teamMemberRepository.findByProjectIdAndUserId(projectId, userId).isPresent()) {
            throw new BusinessRuleException("User is already a team member of this project");
        }
        return teamMemberRepository.save(ProgramTeamMember.builder()
                .projectId(projectId)
                .userId(userId)
                .cftRole(cftRole)
                .isProgramManager(isProgramManager)
                .build());
    }

    @Transactional
    public void removeTeamMember(Long projectId, Long userId) {
        findById(projectId);
        teamMemberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    // ---- Milestones ----

    @Transactional(readOnly = true)
    public List<ProgramMilestone> getMilestones(Long projectId) {
        findById(projectId);
        return milestoneRepository.findByProjectIdOrderBySequenceNoAsc(projectId);
    }

    @Transactional
    public ProgramMilestone addMilestone(Long projectId, ProgramMilestone milestone) {
        findById(projectId);
        milestone.setProjectId(projectId);
        return milestoneRepository.save(milestone);
    }

    @Transactional
    public ProgramMilestone updateMilestone(Long milestoneId, ProgramMilestone updated) {
        ProgramMilestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", milestoneId));
        milestone.setMilestoneName(updated.getMilestoneName());
        milestone.setMilestoneType(updated.getMilestoneType());
        milestone.setPlannedDate(updated.getPlannedDate());
        milestone.setActualDate(updated.getActualDate());
        milestone.setStatus(updated.getStatus());
        milestone.setOwnerUserId(updated.getOwnerUserId());
        milestone.setNotes(updated.getNotes());
        milestone.setSequenceNo(updated.getSequenceNo());
        return milestoneRepository.save(milestone);
    }

    @Transactional
    public void deleteMilestone(Long milestoneId) {
        if (!milestoneRepository.existsById(milestoneId)) {
            throw new ResourceNotFoundException("Milestone", milestoneId);
        }
        milestoneRepository.deleteById(milestoneId);
    }

    // ---- Customer Reps ----

    @Transactional(readOnly = true)
    public List<ProgramCustomerRep> getCustomerReps(Long projectId) {
        findById(projectId);
        return customerRepRepository.findByProjectId(projectId);
    }

    @Transactional
    public ProgramCustomerRep addCustomerRep(Long projectId, Long contactId, String repRole, boolean isPrimary) {
        findById(projectId);
        return customerRepRepository.save(ProgramCustomerRep.builder()
                .projectId(projectId)
                .contactId(contactId)
                .repRole(repRole)
                .isPrimary(isPrimary)
                .build());
    }

    @Transactional
    public void removeCustomerRep(Long projectId, Long contactId) {
        findById(projectId);
        customerRepRepository.deleteByProjectIdAndContactId(projectId, contactId);
    }

    // ---- Private helpers ----

    private Project findById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
    }

    private String generateMunNo() {
        int year = Year.now().getValue() % 100;
        long count = projectRepository.count() + 1;
        return String.format("MUN-%02d-%04d", year, count);
    }

    /**
     * Generates code in format: PROG-{CUSTOMER_CODE}-{YEAR}-{SEQ}
     * e.g. PROG-HONDA-2026-1
     */
    private String generateProjectCode(Long customerId) {
        int year = Year.now().getValue();
        String customerCode = customerRepository.findById(customerId)
                .map(c -> sanitize(c.getCustomerCode()))
                .orElse("C" + customerId);

        String prefix = "PROG-" + customerCode + "-" + year + "-";
        long seq = projectRepository.countByProjectCodeStartsWith(prefix) + 1;
        return prefix + seq;
    }

    private String sanitize(String code) {
        return code.toUpperCase().replaceAll("[^A-Z0-9]", "");
    }

    private void seedDefaultMilestones(Project project) {
        int seq = 1;
        if (project.getSampleDate() != null) {
            saveMilestone(project.getId(), "Sample Submission", "SAMPLE", project.getSampleDate(), seq++);
        }
        if (project.getSosDate() != null) {
            saveMilestone(project.getId(), "Start of Series (SOS)", "SOS", project.getSosDate(), seq++);
        }
        if (project.getSopDate() != null) {
            saveMilestone(project.getId(), "Start of Production (SOP)", "SOP", project.getSopDate(), seq);
        }
    }

    private void saveMilestone(Long projectId, String name, String type, LocalDate date, int seq) {
        milestoneRepository.save(ProgramMilestone.builder()
                .projectId(projectId)
                .milestoneName(name)
                .milestoneType(type)
                .plannedDate(date)
                .status("PENDING")
                .sequenceNo(seq)
                .build());
    }

    private void validateStatusTransition(Project.ProjectStatus current, Project.ProjectStatus next) {
        if (current == Project.ProjectStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot change status of a cancelled project");
        }
        if (current == Project.ProjectStatus.COMPLETED && next == Project.ProjectStatus.DRAFT) {
            throw new BusinessRuleException("Cannot revert completed project to draft");
        }
    }

    private ProjectResponse mapToResponse(Project p) {
        String customerName = customerRepository.findById(p.getCustomerId())
                .map(Customer::getCustomerName)
                .orElse(null);

        return new ProjectResponse(
                p.getId(), p.getMunNo(), p.getProjectCode(), p.getProjectName(),
                p.getCustomerId(), customerName, p.getPlantId(), null,
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
