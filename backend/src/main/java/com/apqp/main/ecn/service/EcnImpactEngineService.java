package com.apqp.main.ecn.service;

import com.apqp.main.apqp.repository.ProjectApqpTaskRepository;
import com.apqp.main.apqp.service.ApqpTaskGeneratorService;
import com.apqp.main.bom.repository.BomLineRepository;
import com.apqp.main.bom.repository.BomRepository;
import com.apqp.main.bom.repository.PartRepository;
import com.apqp.main.ecn.entity.ChangeRequest;
import com.apqp.main.ecn.entity.EcnImpactedObject;
import com.apqp.main.ecn.entity.EcnImpactedObject.ObjectType;
import com.apqp.main.ecn.repository.EcnImpactRepository;
import com.apqp.main.ppap.repository.PpapRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * ECN Impact Engine — core logic for detecting and propagating
 * engineering change impacts across BOM, Process, Tooling, PPAP, and APQP.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EcnImpactEngineService {

    private final EcnImpactRepository impactRepository;
    private final BomLineRepository bomLineRepository;
    private final BomRepository bomRepository;
    private final PartRepository partRepository;
    private final PpapRepository ppapRepository;
    private final ProjectApqpTaskRepository apqpTaskRepository;
    private final ApqpTaskGeneratorService taskGeneratorService;

    /**
     * Run dependency scan when an ECN is submitted.
     * Builds the full impact graph and persists impacted objects.
     */
    @Transactional
    public List<EcnImpactedObject> runImpactAnalysis(ChangeRequest ecn) {
        List<EcnImpactedObject> impacts = new ArrayList<>();

        if (ecn.getPartId() != null) {
            // 1. BOM impact — all BOM headers that include this part
            bomRepository.findByProjectIdOrderByCreatedAtDesc(ecn.getProjectId())
                    .forEach(bom -> impacts.add(buildImpact(ecn.getId(), ObjectType.BOM,
                            bom.getId(), "BOM Rev " + bom.getBomRevision(),
                            null, null, "Update BOM revision due to part change")));

            // 2. PPAP impact — existing PPAP packages for this part
            ppapRepository.findByProjectIdAndPartId(ecn.getProjectId(), ecn.getPartId())
                    .forEach(ppap -> impacts.add(buildImpact(ecn.getId(), ObjectType.PPAP,
                            ppap.getId(), "PPAP Package",
                            ppap.getOverallStatus().name(), "RESUBMIT_REQUIRED",
                            "PPAP re-submission required due to engineering change")));

            // 3. Part revision impact
            impacts.add(buildImpact(ecn.getId(), ObjectType.PART,
                    ecn.getPartId(), "Part: " + ecn.getPartId(),
                    ecn.getOldRevision(), ecn.getNewRevision(),
                    "Update part drawing revision"));
        }

        // 4. APQP tasks — flag relevant phase tasks for review based on ECN type
        List<Long> phasesToReopen = getPhasesToReopenForEcnType(ecn.getEcnType());
        phasesToReopen.forEach(phaseId -> {
            long taskCount = apqpTaskRepository.countTotalTasksInPhase(ecn.getProjectId(), phaseId);
            if (taskCount > 0) {
                impacts.add(buildImpact(ecn.getId(), ObjectType.PART,
                        phaseId, "APQP Phase " + phaseId + " tasks",
                        null, null, "Review and reopen APQP tasks in this phase"));
            }
        });

        List<EcnImpactedObject> saved = impactRepository.saveAll(impacts);
        log.info("ECN {} impact analysis complete: {} objects impacted", ecn.getEcnNo(), saved.size());
        return saved;
    }

    /**
     * Apply ECN — execute all automatic actions after approval.
     */
    @Transactional
    public void applyEcn(ChangeRequest ecn, Long appliedBy) {
        if (ecn.getSeverity() == ChangeRequest.EcnSeverity.MAJOR
                || ecn.getEcnType() == ChangeRequest.EcnType.DESIGN_CHANGE
                || ecn.getEcnType() == ChangeRequest.EcnType.PROCESS_CHANGE) {

            // Reopen APQP tasks for impacted phases
            List<Long> phases = getPhasesToReopenForEcnType(ecn.getEcnType());
            phases.forEach(phaseId ->
                    taskGeneratorService.reopenTasksForEcn(ecn.getProjectId(), phaseId, appliedBy));
        }

        // Mark PPAP packages for resubmission
        if (ecn.getPartId() != null) {
            ppapRepository.findByProjectIdAndPartId(ecn.getProjectId(), ecn.getPartId())
                    .forEach(ppap -> {
                        ppap.setResubmissionRequired(true);
                        ppap.setResubmissionReason("ECN: " + ecn.getEcnNo() + " — " + ecn.getTitle());
                        ppapRepository.save(ppap);
                    });
        }

        log.info("ECN {} applied. Downstream impacts propagated.", ecn.getEcnNo());
    }

    @Transactional(readOnly = true)
    public List<EcnImpactedObject> getImpacts(Long ecnId) {
        return impactRepository.findByEcnId(ecnId);
    }

    @Transactional(readOnly = true)
    public List<EcnImpactedObject> getUnresolvedImpacts(Long ecnId) {
        return impactRepository.findByEcnIdAndIsResolvedFalse(ecnId);
    }

    private EcnImpactedObject buildImpact(Long ecnId, ObjectType type, Long objectId,
                                           String ref, String oldVal, String newVal, String action) {
        return EcnImpactedObject.builder()
                .ecnId(ecnId)
                .objectType(type)
                .objectId(objectId)
                .objectRef(ref)
                .oldValue(oldVal)
                .newValue(newVal)
                .actionRequired(action)
                .isResolved(false)
                .build();
    }

    private List<Long> getPhasesToReopenForEcnType(ChangeRequest.EcnType type) {
        return switch (type) {
            case DESIGN_CHANGE          -> List.of(2L, 3L, 4L);  // Product, Process, Validation
            case PROCESS_CHANGE         -> List.of(3L, 4L);       // Process, Validation
            case MATERIAL_CHANGE        -> List.of(2L, 3L, 4L);
            case VENDOR_CHANGE          -> List.of(3L, 4L);
            case TOOLING_CHANGE         -> List.of(3L, 4L);
            case COST_REDUCTION         -> List.of(3L);
            case QUALITY_IMPROVEMENT    -> List.of(3L, 4L);
        };
    }
}
