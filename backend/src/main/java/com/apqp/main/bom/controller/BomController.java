package com.apqp.main.bom.controller;

import com.apqp.main.bom.dto.BomTreeNode;
import com.apqp.main.bom.entity.BomHeader;
import com.apqp.main.bom.entity.BomLine;
import com.apqp.main.bom.entity.Part;
import com.apqp.main.bom.repository.BomRepository;
import com.apqp.main.bom.repository.PartRepository;
import com.apqp.main.bom.service.BomService;
import com.apqp.main.auth.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "BOM Studio", description = "Bill of Materials Management APIs")
@RestController
@RequiredArgsConstructor
public class BomController {

    private final BomService bomService;
    private final BomRepository bomRepository;
    private final PartRepository partRepository;

    @Operation(summary = "Get BOM tree for a project")
    @GetMapping("/bom/{bomId}/tree")
    public ResponseEntity<BomTreeNode> getBomTree(@PathVariable Long bomId) {
        return ResponseEntity.ok(bomService.getBomTree(bomId));
    }

    @Operation(summary = "Get all BOM versions for a project")
    @GetMapping("/projects/{projectId}/bom")
    public ResponseEntity<List<BomHeader>> getProjectBoms(@PathVariable Long projectId) {
        return ResponseEntity.ok(bomRepository.findByProjectIdOrderByCreatedAtDesc(projectId));
    }

    @Operation(summary = "Create a new BOM header for an assembly")
    @PostMapping("/projects/{projectId}/bom")
    public ResponseEntity<BomHeader> createBom(
            @PathVariable Long projectId,
            @RequestParam Long topPartId,
            @AuthenticationPrincipal UserPrincipal principal) {
        BomHeader bom = BomHeader.builder()
                .projectId(projectId)
                .topPartId(topPartId)
                .bomRevision("1")
                .bomType("ENGINEERING")
                .effectiveFrom(java.time.LocalDate.now())
                .status(BomHeader.ApprovalStatus.PENDING)
                .isCurrent(true)
                .createdBy(principal.getId())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(bomRepository.save(bom));
    }

    @Operation(summary = "Add a BOM line (child part to assembly)")
    @PostMapping("/bom/{bomId}/lines")
    public ResponseEntity<BomLine> addLine(
            @PathVariable Long bomId,
            @RequestParam Long parentPartId,
            @RequestParam Long childPartId,
            @RequestParam(defaultValue = "1") BigDecimal quantity,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bomService.addBomLine(bomId, parentPartId, childPartId, quantity, principal.getId()));
    }

    @Operation(summary = "Get all parts for a project")
    @GetMapping("/projects/{projectId}/parts")
    public ResponseEntity<List<Part>> getProjectParts(@PathVariable Long projectId) {
        return ResponseEntity.ok(partRepository.findByProjectIdAndIsActiveTrue(projectId));
    }

    @Operation(summary = "Create a part")
    @PostMapping("/projects/{projectId}/parts")
    public ResponseEntity<Part> createPart(
            @PathVariable Long projectId,
            @Valid @RequestBody Part part,
            @AuthenticationPrincipal UserPrincipal principal) {
        part.setProjectId(projectId);
        part.setCreatedBy(principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(partRepository.save(part));
    }

    @Operation(summary = "Where-used analysis for a part")
    @GetMapping("/parts/{partId}/where-used")
    public ResponseEntity<List<Long>> whereUsed(@PathVariable Long partId) {
        return ResponseEntity.ok(bomService.getWhereUsed(partId));
    }
}
