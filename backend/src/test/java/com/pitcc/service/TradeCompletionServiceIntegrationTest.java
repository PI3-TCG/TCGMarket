package com.pitcc.service;

import com.pitcc.model.Ad;
import com.pitcc.model.AdReservation;
import com.pitcc.model.AdReservationStatus;
import com.pitcc.model.AdStatus;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CardSnapshot;
import com.pitcc.model.CollectionItem;
import com.pitcc.model.FinancialAdjustment;
import com.pitcc.model.TargetAdSnapshot;
import com.pitcc.model.TradeProposal;
import com.pitcc.model.TradeProposalEventType;
import com.pitcc.model.TradeProposalItem;
import com.pitcc.model.TradeProposalStatus;
import com.pitcc.model.Transaction;
import com.pitcc.model.TransactionType;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CollectionItemRepository;
import com.pitcc.repository.TradeProposalRepository;
import com.pitcc.repository.TransactionRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class TradeCompletionServiceIntegrationTest {

    @Autowired private TradeCompletionService service;
    @Autowired private TradeProposalRepository proposalRepository;
    @Autowired private CollectionItemRepository collectionRepository;
    @Autowired private AdRepository adRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private MongoTemplate mongoTemplate;

    private String proposer;
    private String recipient;
    private Ad ad;
    private CollectionItem anchor;
    private final List<String> proposalIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        proposer = "trade-proposer-" + UUID.randomUUID();
        recipient = "trade-recipient-" + UUID.randomUUID();

        // Destinatário: 4 exemplares, 3 deles reservados no anúncio de origem.
        anchor = item(recipient, "card-anchor", 4);
        ad = adRepository.save(new Ad(recipient, anchor, 3, false, true, null, Instant.now()));
        ReflectionTestUtils.setField(anchor, "committedQuantity", 3);
        AdReservation reservation = new AdReservation(ad.getId(), 3, false, true, null, Instant.now());
        ReflectionTestUtils.setField(reservation, "status", AdReservationStatus.ACTIVE);
        ReflectionTestUtils.setField(anchor, "adReservations", new ArrayList<>(List.of(reservation)));
        collectionRepository.save(anchor);
    }

    @AfterEach
    void tearDown() {
        mongoTemplate.remove(Query.query(Criteria.where("userId").in(proposer, recipient)), CollectionItem.class);
        adRepository.deleteById(ad.getId());
        proposalIds.forEach(id -> {
            proposalRepository.deleteById(id);
            transactionRepository.findByTypeAndSourceId(TransactionType.TRADE, id)
                    .ifPresent(transactionRepository::delete);
        });
    }

    @Test
    void oneForOneMovesBothCardsAndRecordsTheTrade() {
        CollectionItem offered = collectionRepository.save(item(proposer, "card-a", 2));

        TradeProposal proposal = accepted(
                List.of(line(offered, null, 1)),
                List.of(line(anchor, ad.getId(), 1)));

        assertEquals(TradeProposalStatus.COMPLETED, service.complete(proposal.getId()));

        assertEquals(1, quantityOf(proposer, "card-a"));
        assertEquals(1, quantityOf(recipient, "card-a"));
        assertEquals(3, quantityOf(recipient, "card-anchor"));
        assertEquals(1, quantityOf(proposer, "card-anchor"));

        Ad current = adRepository.findById(ad.getId()).orElseThrow();
        assertEquals(2, current.getRemainingQuantity());
        assertEquals(AdStatus.ACTIVE, current.getStatus());

        TradeProposal completed = proposalRepository.findById(proposal.getId()).orElseThrow();
        assertEquals(TradeProposalStatus.COMPLETED, completed.getStatus());
        assertNotNull(completed.getCompletedAt());
        assertEquals(TradeProposalEventType.COMPLETED, completed.getEvents().getLast().getEventType());

        Transaction transaction = transactionRepository.findById(completed.getTransactionId()).orElseThrow();
        assertEquals(TransactionType.TRADE, transaction.getType());
        assertEquals(recipient, transaction.getSellerId());
        assertEquals(proposer, transaction.getBuyerId());
        assertEquals(2, transaction.getItems().size());
        assertNull(transaction.getFinancialAdjustment());
    }

    @Test
    void financialAdjustmentIsKeptInTheTransactionWithoutMovingMoney() {
        CollectionItem offered = collectionRepository.save(item(proposer, "card-a", 1));
        FinancialAdjustment adjustment = new FinancialAdjustment(
                new BigDecimal("15.50"), "BRL", proposer, recipient);

        TradeProposal proposal = accepted(
                List.of(line(offered, null, 1)),
                List.of(line(anchor, ad.getId(), 1)),
                adjustment);

        service.complete(proposal.getId());

        String transactionId = proposalRepository.findById(proposal.getId()).orElseThrow().getTransactionId();
        FinancialAdjustment recorded = transactionRepository.findById(transactionId).orElseThrow()
                .getFinancialAdjustment();
        assertEquals(0, new BigDecimal("15.50").compareTo(recorded.getAmount()));
        assertEquals("BRL", recorded.getCurrency());
        assertEquals(proposer, recorded.getPayerId());
        assertEquals(recipient, recorded.getPayeeId());
        assertEquals(1, quantityOf(proposer, "card-anchor"));
    }

    @Test
    void oneForManyTransfersEveryRequestedCard() {
        CollectionItem offered = collectionRepository.save(item(proposer, "card-a", 1));
        CollectionItem extra = collectionRepository.save(item(recipient, "card-b", 2));

        TradeProposal proposal = accepted(
                List.of(line(offered, null, 1)),
                List.of(line(anchor, ad.getId(), 2), line(extra, null, 2)));

        service.complete(proposal.getId());

        assertFalse(collectionRepository.existsById(offered.getId()));
        assertFalse(collectionRepository.existsById(extra.getId()));
        assertEquals(1, quantityOf(recipient, "card-a"));
        assertEquals(2, quantityOf(proposer, "card-anchor"));
        assertEquals(2, quantityOf(proposer, "card-b"));
        assertEquals(2, quantityOf(recipient, "card-anchor"));
    }

    @Test
    void manyForOneSellsOutTheAdWhenItsReservationEnds() {
        CollectionItem first = collectionRepository.save(item(proposer, "card-a", 3));
        CollectionItem second = collectionRepository.save(item(proposer, "card-b", 1));

        TradeProposal proposal = accepted(
                List.of(line(first, null, 2), line(second, null, 1)),
                List.of(line(anchor, ad.getId(), 3)));

        service.complete(proposal.getId());

        assertEquals(1, quantityOf(proposer, "card-a"));
        assertEquals(2, quantityOf(recipient, "card-a"));
        assertEquals(1, quantityOf(recipient, "card-b"));
        assertEquals(3, quantityOf(proposer, "card-anchor"));
        assertEquals(1, quantityOf(recipient, "card-anchor"));

        Ad current = adRepository.findById(ad.getId()).orElseThrow();
        assertEquals(0, current.getRemainingQuantity());
        assertEquals(AdStatus.SOLD_OUT, current.getStatus());
    }

    @Test
    void manyForManyAddsToCardsTheReceiverAlreadyOwns() {
        CollectionItem first = collectionRepository.save(item(proposer, "card-a", 2));
        CollectionItem second = collectionRepository.save(item(proposer, "card-b", 2));
        CollectionItem extra = collectionRepository.save(item(recipient, "card-c", 1));
        collectionRepository.save(item(recipient, "card-a", 5));

        TradeProposal proposal = accepted(
                List.of(line(first, null, 2), line(second, null, 1)),
                List.of(line(anchor, ad.getId(), 1), line(extra, null, 1)));

        service.complete(proposal.getId());

        assertEquals(7, quantityOf(recipient, "card-a"));
        assertEquals(1, quantityOf(recipient, "card-b"));
        assertEquals(1, quantityOf(proposer, "card-b"));
        assertEquals(1, quantityOf(proposer, "card-anchor"));
        assertEquals(1, quantityOf(proposer, "card-c"));
    }

    @Test
    void completingAgainDoesNotDuplicateTheTransfer() {
        CollectionItem offered = collectionRepository.save(item(proposer, "card-a", 2));
        TradeProposal proposal = accepted(
                List.of(line(offered, null, 1)),
                List.of(line(anchor, ad.getId(), 1)));

        service.complete(proposal.getId());
        // Simula uma queda após a transferência, antes de marcar a proposta.
        mongoTemplate.updateFirst(Query.query(Criteria.where("_id").is(proposal.getId())),
                new Update().set("status", TradeProposalStatus.ACCEPTED),
                TradeProposal.class);
        service.complete(proposal.getId());
        service.complete(proposal.getId());

        assertEquals(1, quantityOf(proposer, "card-a"));
        assertEquals(1, quantityOf(recipient, "card-a"));
        assertEquals(1, quantityOf(proposer, "card-anchor"));
        assertEquals(3, quantityOf(recipient, "card-anchor"));
        assertEquals(2, adRepository.findById(ad.getId()).orElseThrow().getRemainingQuantity());
        assertEquals(1, mongoTemplate.count(Query.query(Criteria.where("type").is(TransactionType.TRADE)
                .and("sourceId").is(proposal.getId())), Transaction.class));
    }

    @Test
    void missingCardsKeepTheProposalAcceptedAndNeverGoNegative() {
        CollectionItem offered = collectionRepository.save(item(proposer, "card-a", 1));
        TradeProposal proposal = accepted(
                List.of(line(offered, null, 1)),
                List.of(line(anchor, ad.getId(), 1)));
        // O proponente vendeu a carta depois do aceite.
        collectionRepository.deleteById(offered.getId());

        assertThrows(IllegalStateException.class, () -> service.complete(proposal.getId()));
        assertEquals(TradeProposalStatus.ACCEPTED, service.completeQuietly(proposal.getId()));

        assertEquals(TradeProposalStatus.ACCEPTED,
                proposalRepository.findById(proposal.getId()).orElseThrow().getStatus());
        assertEquals(0, quantityOf(recipient, "card-a"));
        assertTrue(transactionRepository.findByTypeAndSourceId(TransactionType.TRADE, proposal.getId()).isEmpty());
    }

    private TradeProposal accepted(List<TradeProposalItem> offered, List<TradeProposalItem> requested) {
        return accepted(offered, requested, null);
    }

    private TradeProposal accepted(
            List<TradeProposalItem> offered,
            List<TradeProposalItem> requested,
            FinancialAdjustment adjustment
    ) {
        TradeProposal proposal = TradeProposal.create(
                proposer, recipient, ad.getId(),
                new TargetAdSnapshot(recipient, anchor.getId(), anchor.getCardId(), true),
                offered, requested, adjustment, null, Instant.now());
        ReflectionTestUtils.setField(proposal, "status", TradeProposalStatus.ACCEPTED);
        proposalIds.add(proposal.getId());
        return proposalRepository.save(proposal);
    }

    private static CollectionItem item(String userId, String cardId, int quantity) {
        CollectionItem item = new CollectionItem(
                userId, cardId, quantity, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
        ReflectionTestUtils.setField(item, "id", "item-" + UUID.randomUUID());
        return item;
    }

    private static TradeProposalItem line(CollectionItem item, String adId, int quantity) {
        return new TradeProposalItem(item.getId(), item.getCardId(), adId, quantity, new CardSnapshot(
                item.getCardId(), item.getCardId(), CardGame.POKEMON, "Base", "1", null,
                CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE));
    }

    private int quantityOf(String userId, String cardId) {
        return collectionRepository.findAll().stream()
                .filter(item -> userId.equals(item.getUserId()) && cardId.equals(item.getCardId()))
                .mapToInt(CollectionItem::getQuantity)
                .sum();
    }
}
