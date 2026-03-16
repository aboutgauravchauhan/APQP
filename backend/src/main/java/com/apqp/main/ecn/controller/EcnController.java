package com.apqp.main.ecn.controller;

import com.apqp.main.auth.security.UserPrincipal;
import com.apqp.main.ecn.dto.EcnRequest;
import com.apqp.main.ecn.entity.ChangeRequest;
import com.apqp.main.ecn.entity.EcnImpactedObject;
import com.apqp.main.ecn.service.EcnService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "ECN", description = "Engineering Change Notice Management APIs")
@RestController
@RequestMapping("/ecn")
@RequiredArgsConstructor
public class EcnController {

    private final EcnService ecnService;

    @Operation(summary = "Create a new ECN (Draft)")
    @PostMapping
    public ResponseEntity<ChangeRequest> create(
            @Valid @RequestBody EcnRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ecnService.createEcn(request, principal.getId()));
    }

    @Operation(summary = "Submit ECN for review (triggers impact analysis)")
    @PostMapping("/{ecnId}/submit")
    public ResponseEntity<ChangeRequest> submit(@PathVariable Long ecnId) {
        return ResponseEntity.ok(ecnService.submitEcn(ecnId));
    }

    @Operation(summary = "Approve ECN (propagates changes to APQP, PPAP, BOM)")
    @PostMapping("/{ecnId}/approve")
    public ResponseEntity<ChangeRequest> approve(
            @PathVariable Long ecnId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ecnService.approveEcn(ecnId, principal.getId()));
    }

    @Operation(summary = "Reject ECN")
    @PostMapping("/{ecnId}/reject")
    public ResponseEntity<ChangeRequest> reject(
            @PathVariable Long ecnId,
            @RequestParam String reason,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ecnService.rejectEcn(ecnId, principal.getId(), reason));
    }

    @Operation(summary = "Get all ECNs for a project")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ChangeRequest>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ecnService.getEcnsForProject(projectId));
    }

    @Operation(summary = "Get ECN details")
    @GetMapping("/{ecnId}")
    public ResponseEntity<ChangeRequest> getById(@PathVariable Long ecnId) {
        return ResponseEntity.ok(ecnService.getEcn(ecnId));
    }

    @Operation(summary = "Get impact objects for an ECN")
    @GetMapping("/{ecnId}/impacts")
    public ResponseEntity<List<EcnImpactedObject>> getImpacts(@PathVariable Long ecnId) {
        return ResponseEntity.ok(ecnService.getImpacts(ecnId));
    }
}
