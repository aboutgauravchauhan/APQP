package com.apqp.main.dashboard.service;

import com.apqp.main.apqp.entity.ProjectApqpTask;
import com.apqp.main.apqp.repository.ProjectApqpTaskRepository;
import com.apqp.main.dashboard.dto.DashboardSummary;
import com.apqp.main.ecn.repository.ChangeRequestRepository;
import com.apqp.main.ppap.repository.PpapRepository;
import com.apqp.main.project.entity.Project;
import com.apqp.main.project.repository.ProjectRepository;
import com.apqp.main.vendor.entity.Vendor;
import com.apqp.main.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final ProjectApqpTaskRepository taskRepository;
    private final PpapRepository ppapRepository;
    private final ChangeRequestRepository ecnRepository;
    private final VendorRepository vendorRepository;

    @Transactional(readOnly = true)
    public DashboardSummary getSummary() {
        LocalDate today = LocalDate.now();
        LocalDate endOfWeek = today.plusDays(7);

        // Project stats
        long totalActive = projectRepository.countByStatus(Project.ProjectStatus.ACTIVE);
        long completed = projectRepository.countByStatus(Project.ProjectStatus.COMPLETED);
        long atRisk = projectRepository.countRedRiskActiveProjects();

        // Task stats
        List<ProjectApqpTask> overdueTasks = taskRepository.findOverdueTasks(today);
        long overdueCount = overdueTasks.size();

        // PPAP stats
        long ppapPending = ppapRepository.countPendingPpaps();
        long ppapResubmit = ppapRepository.countResubmissionRequired();

        // ECN stats
        long openEcns = ecnRepository.countOpenEcns();

        // Vendor stats
        long vendorsNotEvaluated = vendorRepository.findByApprovalStatus(
                Vendor.ApprovalStatus.NOT_EVALUATED).size();
        long vendorsBlacklisted = vendorRepository.findByStatus(
                Vendor.VendorStatus.BLACKLISTED).size();

        // Build alerts
        List<DashboardSummary.Alert> alerts = new ArrayList<>();
        if (overdueCount > 0) {
            alerts.add(new DashboardSummary.Alert(
                    "OVERDUE_TASKS", overdueCount + " APQP tasks are overdue", "RED", null, "TASK"));
        }
        if (ppapResubmit > 0) {
            alerts.add(new DashboardSummary.Alert(
                    "PPAP_RESUBMIT", ppapResubmit + " PPAP packages require resubmission", "AMBER", null, "PPAP"));
        }
        if (openEcns > 0) {
            alerts.add(new DashboardSummary.Alert(
                    "OPEN_ECNS", openEcns + " ECNs pending action", "AMBER", null, "ECN"));
        }
        if (atRisk > 0) {
            alerts.add(new DashboardSummary.Alert(
                    "RED_PROJECTS", atRisk + " projects flagged RED risk", "RED", null, "PROJECT"));
        }

        return new DashboardSummary(
                totalActive,
                totalActive - atRisk,
                0L,  // delayed — can be enhanced with SOP comparison
                atRisk,
                completed,
                overdueCount,
                0L,
                0L,
                ppapPending,
                0L,
                ppapResubmit,
                openEcns,
                0L,
                vendorsNotEvaluated,
                vendorsBlacklisted,
                List.of(),
                alerts
        );
    }
}
