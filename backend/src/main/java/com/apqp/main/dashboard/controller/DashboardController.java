package com.apqp.main.dashboard.controller;

import com.apqp.main.dashboard.dto.DashboardSummary;
import com.apqp.main.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Dashboard", description = "Executive Control Tower Dashboard")
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Get executive dashboard summary")
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }
}
