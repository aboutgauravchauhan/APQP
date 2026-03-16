package com.apqp.main.bom.dto;

import com.apqp.main.bom.entity.Part;

import java.math.BigDecimal;
import java.util.List;

public record BomTreeNode(
    Long bomLineId,
    Long partId,
    String partNo,
    String partName,
    Part.PartType partType,
    Part.SourcingType sourcingType,
    String drawingRevision,
    String materialSpec,
    BigDecimal weightKg,
    BigDecimal quantity,
    String uom,
    BigDecimal scrapPercent,
    String findNo,
    Long preferredVendorId,
    String vendorName,
    Integer levelNo,
    Integer sequenceNo,
    List<BomTreeNode> children
) {}
