package com.apqp.main.ecn.service;

import com.apqp.main.common.exception.BusinessRuleException;
import com.apqp.main.common.exception.ResourceNotFoundException;
import com.apqp.main.ecn.dto.EcnRequest;
import com.apqp.main.ecn.entity.ChangeRequest;
import com.apqp.main.ecn.entity.EcnImpactedObject;
import com.apqp.main.ecn.repository.ChangeRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Year;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class EcnService {

    private final ChangeRequestRepository ecnRepository;
    private final EcnImpactEngineService impactEngine;

    private final AtomicInteger ecnSequence = new AtomicInteger(1);

    @Transactional
    public ChangeRequest createEcn(EcnRequest request, Long requestedBy) {
        String ecnNo = generateEcnNo(request.projectId());

        ChangeRequest ecn = ChangeRequest.builder()
                .projectId(request.projectId())
                .partId(request.partId())
                .ecnNo(ecnNo)
                .ecnType(request.ecnType())
                .severity(request.severity())
                .title(request.title())
                .description(request.description())
                .reason(request.reason())
                .impactCost(request.impactCost())
                .impactTimelineDays(request.impactTimelineDays())
                .impactQuality(request.impactQuality())
                .oldRevision(request.oldRevision())
                .newRevision(request.newRevision())
                .status(ChangeRequest.EcnStatus.DRAFT)
                .requestedBy(requestedBy)
                .requestedAt(Instant.now())
                .build();

        return ecnRepository.save(ecn);
    }

    @Transactional
    public ChangeRequest submitEcn(Long ecnId) {
        ChangeRequest ecn = findById(ecnId);
        validateTransition(ecn.getStatus(), ChangeRequest.EcnStatus.SUBMITTED);

        ecn.setStatus(ChangeRequest.EcnStatus.SUBMITTED);
        ecn = ecnRepository.save(ecn);

        // Run impact analysis automatically
        impactEngine.runImpactAnalysis(ecn);

        return ecn;
    }

    @Transactional
    public ChangeRequest approveEcn(Long ecnId, Long approvedBy) {
        ChangeRequest ecn = findById(ecnId);
        validateTransition(ecn.getStatus(), ChangeRequest.EcnStatus.APPROVED);

        ecn.setStatus(ChangeRequest.EcnStatus.APPROVED);
        ecn.setApprovedBy(approvedBy);
        ecn.setApprovedAt(Instant.now());
        ecn = ecnRepository.save(ecn);

        // Apply ECN — propagate changes
        impactEngine.applyEcn(ecn, approvedBy);

        return ecn;
    }

    @Transactional
    public ChangeRequest rejectEcn(Long ecnId, Long rejectedBy, String reason) {
        ChangeRequest ecn = findById(ecnId);
        ecn.setStatus(ChangeRequest.EcnStatus.REJECTED);
        ecn.setImpactQuality(reason);
        return ecnRepository.save(ecn);
    }

    @Transactional(readOnly = true)
    public List<ChangeRequest> getEcnsForProject(Long projectId) {
        return ecnRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    @Transactional(readOnly = true)
    public ChangeRequest getEcn(Long id) {
        return findById(id);
    }

    @Transactional(readOnly = true)
    public List<EcnImpactedObject> getImpacts(Long ecnId) {
        return impactEngine.getImpacts(ecnId);
    }

    private ChangeRequest findById(Long id) {
        return ecnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ECN", id));
    }

    private String generateEcnNo(Long projectId) {
        int year = Year.now().getValue() % 100;
        int seq = ecnSequence.getAndIncrement();
        return String.format("ECN-%02d-P%d-%04d", year, projectId, seq);
    }

    private void validateTransition(ChangeRequest.EcnStatus current, ChangeRequest.EcnStatus next) {
        boolean valid = switch (next) {
            case SUBMITTED     -> current == ChangeRequest.EcnStatus.DRAFT;
            case UNDER_REVIEW  -> current == ChangeRequest.EcnStatus.SUBMITTED;
            case APPROVED      -> current == ChangeRequest.EcnStatus.SUBMITTED
                                  || current == ChangeRequest.EcnStatus.UNDER_REVIEW;
            case IMPLEMENTED   -> current == ChangeRequest.EcnStatus.APPROVED;
            case CLOSED        -> current == ChangeRequest.EcnStatus.IMPLEMENTED;
            default            -> true;
        };
        if (!valid) {
            throw new BusinessRuleException(
                    "Invalid ECN status transition from " + current + " to " + next);
        }
    }
}
