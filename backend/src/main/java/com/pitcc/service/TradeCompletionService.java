package com.pitcc.service;

import com.pitcc.model.TradeProposal;
import com.pitcc.model.TradeProposalEvent;
import com.pitcc.model.TradeProposalEventType;
import com.pitcc.model.TradeProposalItem;
import com.pitcc.model.TradeProposalStatus;
import com.pitcc.model.Transaction;
import com.pitcc.model.TransactionType;
import com.pitcc.repository.AdPurchaseHoldRepository;
import com.pitcc.repository.CollectionItemRepository;
import com.pitcc.repository.CollectionTransferRepository;
import com.pitcc.repository.TradeProposalRepository;
import com.pitcc.repository.TransactionRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.stream.Stream;

/**
 * Transfere as cartas de uma proposta aceita entre as coleções e registra a transação.
 *
 * <p>Sem transação no banco, cada passo é um update condicional marcado com a
 * proposta e o item: repetir a conclusão retoma de onde parou sem duplicar nada.
 * Enquanto não termina, a proposta fica ACCEPTED e o job tenta de novo.
 */
@Service
public class TradeCompletionService {

    private static final Logger log = LoggerFactory.getLogger(TradeCompletionService.class);

    private final TradeProposalRepository proposalRepository;
    private final CollectionItemRepository collectionItemRepository;
    private final CollectionTransferRepository transferRepository;
    private final AdPurchaseHoldRepository adRepository;
    private final TransactionRepository transactionRepository;
    private final MongoTemplate mongoTemplate;

    public TradeCompletionService(
            TradeProposalRepository proposalRepository,
            CollectionItemRepository collectionItemRepository,
            CollectionTransferRepository transferRepository,
            AdPurchaseHoldRepository adRepository,
            TransactionRepository transactionRepository,
            MongoTemplate mongoTemplate
    ) {
        this.proposalRepository = proposalRepository;
        this.collectionItemRepository = collectionItemRepository;
        this.transferRepository = transferRepository;
        this.adRepository = adRepository;
        this.transactionRepository = transactionRepository;
        this.mongoTemplate = mongoTemplate;
    }

    /** Conclui sem propagar falhas; o job tenta de novo. */
    public TradeProposalStatus completeQuietly(String proposalId) {
        try {
            return complete(proposalId);
        } catch (RuntimeException exception) {
            log.error("Troca {} aceita, mas não concluída: {}", proposalId, exception.getMessage());
            return TradeProposalStatus.ACCEPTED;
        }
    }

    public TradeProposalStatus complete(String proposalId) {
        TradeProposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new IllegalStateException("Proposta " + proposalId + " não encontrada."));

        if (proposal.getStatus() == TradeProposalStatus.COMPLETED) {
            return TradeProposalStatus.COMPLETED;
        }
        if (proposal.getStatus() != TradeProposalStatus.ACCEPTED) {
            throw new IllegalStateException("Só propostas aceitas podem ser concluídas.");
        }

        Instant now = Instant.now();

        for (TradeProposalItem item : proposal.getOfferedItems()) {
            transfer(proposal, item, proposal.getProposerId(), proposal.getRecipientId(), now);
        }
        for (TradeProposalItem item : proposal.getRequestedItems()) {
            transfer(proposal, item, proposal.getRecipientId(), proposal.getProposerId(), now);
        }

        String transactionId = recordTransaction(proposal, now);
        markCompleted(proposal, transactionId, now);

        // Só depois de concluída: um item ausente antes disso indica coleção inconsistente.
        Stream.concat(proposal.getOfferedItems().stream(), proposal.getRequestedItems().stream())
                .forEach(item -> transferRepository.deleteIfEmpty(item.getCollectionItemId()));

        return TradeProposalStatus.COMPLETED;
    }

    private void transfer(
            TradeProposal proposal,
            TradeProposalItem item,
            String fromUserId,
            String toUserId,
            Instant now
    ) {
        String mark = "trade:" + proposal.getId() + ":" + item.getCollectionItemId();

        if (item.getSourceAdId() == null) {
            if (!transferRepository.debitFree(
                    item.getCollectionItemId(), fromUserId, item.getQuantity(), mark)) {
                requireDebited(item, mark);
            }
        } else {
            debitFromAd(item, fromUserId, mark, now);
        }

        transferRepository.creditBuyer(
                toUserId,
                item.getCard().getCardId(),
                item.getCard().getCondition(),
                item.getCard().getLanguage(),
                item.getQuantity(),
                mark
        );
    }

    // A carta do anúncio sai da quantidade restante e da reserva na coleção, como numa venda.
    private void debitFromAd(TradeProposalItem item, String ownerId, String mark, Instant now) {
        String adId = item.getSourceAdId();

        if (adRepository.consumeForTrade(adId, mark, item.getQuantity(), now)) {
            adRepository.markSoldOutIfEmpty(adId, now);
        } else if (!adRepository.hasAppliedTrade(adId, mark)) {
            throw new IllegalStateException("Anúncio " + adId + " sem quantidade disponível para a troca.");
        }

        if (!transferRepository.debitSeller(
                item.getCollectionItemId(), ownerId, adId, item.getQuantity(), mark, now)) {
            requireDebited(item, mark);
        }

        transferRepository.closeEmptyReservation(item.getCollectionItemId(), adId, now);
    }

    // O débito não aplicou: ou já foi feito antes, ou a coleção ficou sem exemplares.
    private void requireDebited(TradeProposalItem item, String mark) {
        boolean debited = collectionItemRepository.findById(item.getCollectionItemId())
                .map(owner -> owner.getAppliedTransfers().contains(mark))
                .orElse(false);

        if (!debited) {
            throw new IllegalStateException(
                    "Coleção sem exemplares suficientes para o item " + item.getCollectionItemId() + ".");
        }
    }

    private String recordTransaction(TradeProposal proposal, Instant now) {
        try {
            return transactionRepository.insert(Transaction.fromAcceptedTrade(proposal, now)).getId();
        } catch (DuplicateKeyException alreadyRecorded) {
            return transactionRepository.findByTypeAndSourceId(TransactionType.TRADE, proposal.getId())
                    .map(Transaction::getId)
                    .orElseThrow(() -> alreadyRecorded);
        }
    }

    private void markCompleted(TradeProposal proposal, String transactionId, Instant now) {
        Query query = Query.query(Criteria.where("_id").is(proposal.getId())
                .and("status").is(TradeProposalStatus.ACCEPTED));

        Update update = new Update()
                .set("status", TradeProposalStatus.COMPLETED)
                .set("completedAt", now)
                .set("updatedAt", now)
                .set("transactionId", transactionId)
                .push("events", new TradeProposalEvent(
                        TradeProposalEventType.COMPLETED,
                        TradeProposalStatus.ACCEPTED,
                        TradeProposalStatus.COMPLETED,
                        proposal.getRecipientId(),
                        now,
                        null
                ))
                .inc("version", 1);

        mongoTemplate.updateFirst(query, update, TradeProposal.class);
    }
}
