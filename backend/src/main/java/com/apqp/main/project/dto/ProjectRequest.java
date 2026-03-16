package com.apqp.main.project.dto;

import com.apqp.main.project.entity.Project;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ProjectRequest(
    @NotBlank String projectName,
    @NotNull Long customerId,
    @NotNull Long plantId,
    String vehicleName,
    String vehiclePlatform,
    String modelName,
    String customerPartNo,
    String internalPartNo,
    LocalDate sopDate,
    LocalDate sampleDate,
    LocalDate sosDate,
    Integer annualVolume,
    Integer dailyVolume,
    Project.ProjectType projectType,
    Long projectManagerId,
    Long plantHeadId,
    Long qualityHeadId
) {}
