package com.apqp.main.bom.service;

import com.apqp.main.bom.dto.BomTreeNode;
import com.apqp.main.bom.entity.BomHeader;
import com.apqp.main.bom.entity.BomLine;
import com.apqp.main.bom.entity.Part;
import com.apqp.main.bom.repository.BomLineRepository;
import com.apqp.main.bom.repository.BomRepository;
import com.apqp.main.bom.repository.PartRepository;
import com.apqp.main.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BomService {

    private final BomRepository bomRepository;
    private final BomLineRepository bomLineRepository;
    private final PartRepository partRepository;

    @Transactional(readOnly = true)
    public BomTreeNode getBomTree(Long bomId) {
        BomHeader bom = bomRepository.findById(bomId)
                .orElseThrow(() -> new ResourceNotFoundException("BOM", bomId));

        Part rootPart = partRepository.findById(bom.getTopPartId())
                .orElseThrow(() -> new ResourceNotFoundException("Part", bom.getTopPartId()));

        List<BomLine> allLines = bomLineRepository
                .findByBomIdAndIsActiveTrueOrderByLevelNoAscSequenceNoAsc(bomId);

        // Fetch all parts referenced in this BOM
        java.util.Set<Long> partIds = new java.util.HashSet<>();
        allLines.forEach(l -> { partIds.add(l.getParentPartId()); partIds.add(l.getChildPartId()); });
        Map<Long, Part> partMap = partRepository.findAllById(partIds).stream()
                .collect(Collectors.toMap(Part::getId, Function.identity()));

        // Group lines by parent
        Map<Long, List<BomLine>> byParent = allLines.stream()
                .collect(Collectors.groupingBy(BomLine::getParentPartId));

        return buildNode(rootPart, null, null, partMap, byParent);
    }

    private BomTreeNode buildNode(Part part, BomLine line, Integer levelNo,
                                   Map<Long, Part> partMap, Map<Long, List<BomLine>> byParent) {
        List<BomLine> childLines = byParent.getOrDefault(part.getId(), List.of());

        List<BomTreeNode> children = childLines.stream()
                .map(cl -> {
                    Part childPart = partMap.get(cl.getChildPartId());
                    if (childPart == null) return null;
                    return buildNode(childPart, cl, cl.getLevelNo(), partMap, byParent);
                })
                .filter(n -> n != null)
                .collect(Collectors.toList());

        return new BomTreeNode(
                line != null ? line.getId() : null,
                part.getId(),
                part.getPartNo(),
                part.getPartName(),
                part.getPartType(),
                part.getSourcingType(),
                part.getDrawingRevision(),
                part.getMaterialSpec(),
                part.getWeightKg(),
                line != null ? line.getQuantity() : java.math.BigDecimal.ONE,
                line != null ? line.getUom() : part.getUom(),
                line != null ? line.getScrapPercent() : java.math.BigDecimal.ZERO,
                line != null ? line.getFindNo() : null,
                line != null ? line.getPreferredVendorId() : null,
                null,
                levelNo != null ? levelNo : 0,
                line != null ? line.getSequenceNo() : 0,
                children
        );
    }

    @Transactional
    public BomLine addBomLine(Long bomId, Long parentPartId, Long childPartId,
                               java.math.BigDecimal qty, Long createdBy) {
        BomHeader bom = bomRepository.findById(bomId)
                .orElseThrow(() -> new ResourceNotFoundException("BOM", bomId));

        // Calculate level
        List<BomLine> parentLines = bomLineRepository.findByBomIdAndParentPartIdAndIsActiveTrue(bomId, bom.getTopPartId());
        int level = parentLines.isEmpty() ? 1 : 2; // Simplified; full recursion for deeper trees

        long maxSeq = bomLineRepository.findByBomIdAndParentPartIdAndIsActiveTrue(bomId, parentPartId)
                .stream().mapToLong(BomLine::getSequenceNo).max().orElse(0);

        BomLine line = BomLine.builder()
                .bomId(bomId)
                .parentPartId(parentPartId)
                .childPartId(childPartId)
                .levelNo(level)
                .sequenceNo((int) maxSeq + 10)
                .quantity(qty)
                .isActive(true)
                .build();

        return bomLineRepository.save(line);
    }

    @Transactional(readOnly = true)
    public List<Long> getWhereUsed(Long partId) {
        return partRepository.findWhereUsed(partId);
    }
}
