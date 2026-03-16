package com.apqp.main.dashboard.dto;

import java.util.List;

public record DashboardSummary(
    // Project KPIs
    long totalActiveProjects,
    long projectsOnSchedule,
    long projectsDelayed,
    long projectsAtRisk,
    long projectsCompleted,

    // Task KPIs
    long overdueTasks,
    long tasksInProgress,
    long tasksDueThisWeek,

    // PPAP KPIs
    long ppapPending,
    long ppapApproved,
    long ppapResubmissionRequired,

    // ECN KPIs
    long openEcns,
    long ecnsPendingApproval,

    // Vendor KPIs
    long vendorsNotEvaluated,
    long vendorsBlacklisted,

    // Phase breakdown
    List<PhaseKpi> phaseKpis,

    // Recent alerts
    List<Alert> alerts
) {
    public record PhaseKpi(String phaseCode, String phaseName, long totalTasks, long completed, long overdue) {}

    public record Alert(String type, String message, String severity, Long entityId, String entityType) {}
}
