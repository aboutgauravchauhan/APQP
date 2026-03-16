package com.apqp.main.ppap.controller;

import com.apqp.main.auth.security.UserPrincipal;
import com.apqp.main.ppap.entity.PpapPackage;
import com.apqp.main.ppap.repository.PpapRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "PPAP", description = "PPAP Package Management APIs")
@RestController
@RequestMapping("/ppap")
@RequiredArgsConstructor
public class PpapController {

    private final PpapRepository ppapRepository;

    @Operation(summary = "Create PPAP package for a part")
    @PostMapping
    public ResponseEntity<PpapPackage> create(
            @RequestBody PpapPackage ppap,
            @AuthenticationPrincipal UserPrincipal principal) {
        ppap.setCreatedBy(principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ppapRepository.save(ppap));
    }

    @Operation(summary = "Get PPAP packages for a project")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<PpapPackage>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ppapRepository.findByProjectId(projectId));
    }

    @Operation(summary = "Get PPAP package by ID")
    @GetMapping("/{ppapId}")
    public ResponseEntity<PpapPackage> getById(@PathVariable Long ppapId) {
        return ResponseEntity.ok(ppapRepository.findById(ppapId)
                .orElseThrow(() -> new com.apqp.main.common.exception.ResourceNotFoundException("PPAP", ppapId)));
    }

    @Operation(summary = "Update PPAP overall status")
    @PatchMapping("/{ppapId}/status")
    public ResponseEntity<PpapPackage> updateStatus(
            @PathVariable Long ppapId,
            @RequestParam PpapPackage.PpapStatus status,
            @AuthenticationPrincipal UserPrincipal principal) {
        PpapPackage ppap = ppapRepository.findById(ppapId)
                .orElseThrow(() -> new com.apqp.main.common.exception.ResourceNotFoundException("PPAP", ppapId));
        ppap.setOverallStatus(status);
        if (status == PpapPackage.PpapStatus.APPROVED) {
            ppap.setApprovedBy(principal.getId());
            ppap.setApprovedAt(java.time.Instant.now());
            ppap.setResubmissionRequired(false);
        }
        return ResponseEntity.ok(ppapRepository.save(ppap));
    }
}
