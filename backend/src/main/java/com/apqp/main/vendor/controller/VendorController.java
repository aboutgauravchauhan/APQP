package com.apqp.main.vendor.controller;

import com.apqp.main.auth.security.UserPrincipal;
import com.apqp.main.common.exception.ResourceNotFoundException;
import com.apqp.main.vendor.entity.Vendor;
import com.apqp.main.vendor.repository.VendorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@Tag(name = "Vendors", description = "Vendor Management and Qualification APIs")
@RestController
@RequestMapping("/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorRepository vendorRepository;

    @Operation(summary = "Get all vendors with pagination")
    @GetMapping
    public ResponseEntity<Page<Vendor>> getAll(Pageable pageable) {
        return ResponseEntity.ok(vendorRepository.findAll(pageable));
    }

    @Operation(summary = "Get vendor by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Vendor> getById(@PathVariable Long id) {
        return ResponseEntity.ok(vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", id)));
    }

    @Operation(summary = "Create a new vendor")
    @PostMapping
    public ResponseEntity<Vendor> create(
            @RequestBody Vendor vendor,
            @AuthenticationPrincipal UserPrincipal principal) {
        vendor.setCreatedBy(principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(vendorRepository.save(vendor));
    }

    @Operation(summary = "Update vendor details")
    @PutMapping("/{id}")
    public ResponseEntity<Vendor> update(@PathVariable Long id, @RequestBody Vendor updated) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", id));
        vendor.setVendorName(updated.getVendorName());
        vendor.setVendorType(updated.getVendorType());
        vendor.setLocation(updated.getLocation());
        vendor.setContactPerson(updated.getContactPerson());
        vendor.setContactEmail(updated.getContactEmail());
        vendor.setContactPhone(updated.getContactPhone());
        vendor.setStatus(updated.getStatus());
        return ResponseEntity.ok(vendorRepository.save(vendor));
    }

    @Operation(summary = "Approve or reject vendor")
    @PatchMapping("/{id}/approval")
    public ResponseEntity<Vendor> updateApproval(
            @PathVariable Long id,
            @RequestParam Vendor.ApprovalStatus approvalStatus,
            @AuthenticationPrincipal UserPrincipal principal) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", id));
        vendor.setApprovalStatus(approvalStatus);
        if (approvalStatus == Vendor.ApprovalStatus.APPROVED) {
            vendor.setApprovedBy(principal.getId());
            vendor.setApprovedAt(Instant.now());
        }
        return ResponseEntity.ok(vendorRepository.save(vendor));
    }
}
