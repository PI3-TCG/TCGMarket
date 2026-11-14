package com.pitcc.service;

import com.pitcc.model.TradeProposal;
import com.pitcc.model.TradeProposalStatus;
import com.pitcc.repository.TradeProposalRepository;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

/** Termina trocas aceitas que ficaram sem concluir (queda ou inconsistência). */
@Component
@ConditionalOnProperty(name = "payment.reconciliation.enabled", havingValue = "true", matchIfMissing = true)
public class TradeCompletionJob {

    private static final Duration STALE_AFTER = Duration.ofMinutes(1);

    private final TradeProposalRepository proposalRepository;
    private final TradeCompletionService completionService;

    public TradeCompletionJob(TradeProposalRepository proposalRepository, TradeCompletionService completionService) {
        this.proposalRepository = proposalRepository;
        this.completionService = completionService;
    }

    @Scheduled(
            initialDelayString = "${payment.reconciliation.interval:1m}",
            fixedDelayString = "${payment.reconciliation.interval:1m}"
    )
    public void completeAcceptedTrades() {
        Instant cutoff = Instant.now().minus(STALE_AFTER);

        for (TradeProposal proposal : proposalRepository.findByStatusAndUpdatedAtBefore(
                TradeProposalStatus.ACCEPTED, cutoff)) {
            completionService.completeQuietly(proposal.getId());
        }
    }
}
