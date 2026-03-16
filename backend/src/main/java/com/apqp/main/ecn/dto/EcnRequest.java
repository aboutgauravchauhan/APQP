package com.apqp.main.ecn.dto;

import com.apqp.main.ecn.entity.ChangeRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record EcnRequest(
    @NotNull Long projectId,
    Long partId,
    @NotNull ChangeRequest.EcnType ecnType,
    ChangeRequest.EcnSeverity severity,
    @NotBlank String title,
    @NotBlank String description,
    @NotBlank String reason,
    BigDecimal impactCost,
    Integer impactTimelineDays,
    String impactQuality,
    String oldRevision,
    String newRevision
) {}
