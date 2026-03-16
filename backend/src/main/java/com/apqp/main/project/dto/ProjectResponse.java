package com.apqp.main.project.dto;

import com.apqp.main.project.entity.Project;

import java.time.Instant;
import java.time.LocalDate;

public record ProjectResponse(
    Long id,
    String munNo,
    String projectCode,
    String projectName,
    Long customerId,
    String customerName,
    Long plantId,
    String plantName,
    String vehicleName,
    String vehiclePlatform,
    String modelName,
    String customerPartNo,
    String internalPartNo,
    LocalDate sopDate,
    LocalDate sampleDate,
    Integer annualVolume,
    Integer dailyVolume,
    Project.ProjectType projectType,
    Project.ProjectStatus status,
    Project.RiskLevel riskLevel,
    String riskRemarks,
    Long projectManagerId,
    String projectManagerName,
    Instant createdAt,
    Instant updatedAt
) {}
