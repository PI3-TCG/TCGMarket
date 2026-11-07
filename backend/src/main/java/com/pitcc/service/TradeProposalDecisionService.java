
package com.pitcc.service;

import com.pitcc.exception.TradeProposalConflictException;
import com.pitcc.exception.TradeProposalNotFoundException;
import com.pitcc.model.TradeProposal;
import com.pitcc.model.TradeProposalEvent;
import com.pitcc.model.TradeProposalEventType;
import com.pitcc.model.TradeProposalItem;
import com.pitcc.model.TradeProposalStatus;
import com.pitcc.repository.TradeProposalRepository;

import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;

import static com.pitcc.service.TradeProposalDecisionPolicy.Action;

@Service
public class TradeProposalDecisionService {

    private final TradeProposalRepository repository;
    private final TradeProposalDecisionPolicy policy;
    private final MongoTemplate mongoTemplate;
    private final TradeAvailabilityService availabilityService;

    public TradeProposalDecisionService(
            TradeProposalRepository repository,
            TradeProposalDecisionPolicy policy,
            MongoTemplate mongoTemplate,
            TradeAvailabilityService availabilityService
    ) {
        this.repository = repository;
        this.policy = policy;
        this.mongoTemplate = mongoTemplate;
        this.availabilityService = availabilityService;
    }

    public TradeProposalStatus accept(
            String proposalId,
            String authenticatedUserId
    ) {
        return changeStatus(
                proposalId,
                authenticatedUserId,
                Action.ACCEPT
        );
    }

    public TradeProposalStatus reject(
            String proposalId,
            String authenticatedUserId
    ) {
        return changeStatus(
                proposalId,
                authenticatedUserId,
                Action.REJECT
        );
    }

    public TradeProposalStatus cancel(
            String proposalId,
            String authenticatedUserId
    ) {
        return changeStatus(
                proposalId,
                authenticatedUserId,
                Action.CANCEL
        );
    }

    private TradeProposalStatus changeStatus(
            String proposalId,
            String authenticatedUserId,
            Action action
    ) {
        TradeProposal proposal = repository.findById(proposalId)
                .orElseThrow(TradeProposalNotFoundException::new);

        // Valida o status atual e a permissao do usuario.
        String next = policy.nextStatus(
                action,
                proposal.getStatus().name(),
                proposal.getProposerId(),
                proposal.getRecipientId(),
                authenticatedUserId
        );

        TradeProposalStatus nextStatus =
                TradeProposalStatus.valueOf(next);

        TradeProposalEventType eventType =
                TradeProposalEventType.valueOf(next);

        // Apenas o aceite exige validacao de disponibilidade.
        if (action == Action.ACCEPT) {
            availabilityService.validate(
                    toAvailabilityContext(
                            proposal,
                            authenticatedUserId
                    )
            );
        }

        // Quem pode executar cada acao.
        String ownerField = action == Action.CANCEL
                ? "proposerId"
                : "recipientId";

        // Campo de data correspondente a cada decisao.
        String timestampField = switch (action) {
            case ACCEPT -> "acceptedAt";
            case REJECT -> "rejectedAt";
            case CANCEL -> "cancelledAt";
        };

        Instant now = Instant.now();

        // Atualizacao condicional para impedir duas decisoes
        // sobre a mesma versao da proposta.
        Query query = Query.query(
                Criteria.where("_id").is(proposalId)
                        .and("status").is(TradeProposalStatus.PENDING)
                        .and(ownerField).is(authenticatedUserId)
                        .and("version").is(proposal.getVersion())
        );

        Update update = new Update()
                .set("status", nextStatus)
                .set("updatedAt", now)
                .set(timestampField, now)
                .push("events", new TradeProposalEvent(
                        eventType,
                        TradeProposalStatus.PENDING,
                        nextStatus,
                        authenticatedUserId,
                        now,
                        null
                ))
                .inc("version", 1);

        TradeProposal updated = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                TradeProposal.class
        );

        if (updated == null) {
            throw new TradeProposalConflictException(
                    "A proposta foi alterada por outra operação."
            );
        }

        return updated.getStatus();
    }

    // Converte a proposta persistida para o formato
    // esperado pelo servico existente de disponibilidade.
    private TradeAvailabilityService.TradeContext toAvailabilityContext(
            TradeProposal proposal,
            String authenticatedUserId
    ) {
        return new TradeAvailabilityService.TradeContext(
                authenticatedUserId,
                proposal.getProposerId(),
                proposal.getRecipientId(),
                proposal.getAdId(),
                proposal.getStatus().name(),
                proposal.getOfferedItems().stream()
                        .map(this::toTradeLine)
                        .toList(),
                proposal.getRequestedItems().stream()
                        .map(this::toTradeLine)
                        .toList()
        );
    }

    private TradeAvailabilityService.TradeLine toTradeLine(
            TradeProposalItem item
    ) {
        return new TradeAvailabilityService.TradeLine(
                item.getCollectionItemId(),
                item.getCardId(),
                item.getCard().getCondition(),
                item.getCard().getLanguage(),
                item.getSourceAdId(),
                item.getQuantity()
        );
    }
}
