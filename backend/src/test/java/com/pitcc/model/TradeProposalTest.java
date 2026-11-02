package com.pitcc.model;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

class TradeProposalTest {
    private static final Instant NOW = Instant.parse("2026-11-01T20:00:00Z");

    private CardSnapshot card(String cardId) {
        return new CardSnapshot(cardId, "Carta exemplo", CardGame.POKEMON,
                "Set X", "001", null, CardCondition.NEAR_MINT,
                CardLanguage.PORTUGUESE);
    }

    private TradeProposalItem offered(String id) {
        return new TradeProposalItem(id, "card-a", null, 2, card("card-a"));
    }

    private TradeProposalItem requested() {
        return new TradeProposalItem("item-b", "card-b", "ad-1", 1, card("card-b"));
    }

    private TradeProposal create(FinancialAdjustment adjustment) {
        return TradeProposal.create("alice", "bruno", "ad-1",
                new TargetAdSnapshot("bruno", "item-b", "card-b", true),
                List.of(offered("item-a")), List.of(requested()), adjustment,
                "request-key", NOW);
    }

    @Test
    void createsPendingProposalWithImmutableSnapshotAndCreatedEvent() {
        TradeProposal proposal = create(null);
        assertNotNull(proposal.getId());
        assertEquals(TradeProposalStatus.PENDING, proposal.getStatus());
        assertEquals("alice", proposal.getProposerId());
        assertEquals("bruno", proposal.getRecipientId());
        assertEquals(NOW, proposal.getCreatedAt());
        assertNull(proposal.getCompletedAt());
        assertNull(proposal.getFinancialAdjustment());
        assertEquals(1, proposal.getEvents().size());
        assertEquals(TradeProposalEventType.CREATED, proposal.getEvents().getFirst().getEventType());
        assertEquals(TradeProposalStatus.PENDING, proposal.getEvents().getFirst().getToStatus());
        assertThrows(UnsupportedOperationException.class, () -> proposal.getOfferedItems().clear());
        assertThrows(UnsupportedOperationException.class, () -> proposal.getEvents().clear());
    }

    @Test
    void allowsOptionalAdjustmentBetweenParticipants() {
        FinancialAdjustment adjustment = new FinancialAdjustment(
                new BigDecimal("12.50"), "BRL", "alice", "bruno");
        assertSame(adjustment, create(adjustment).getFinancialAdjustment());
    }

    @Test
    void rejectsSelfNegotiation() {
        assertThrows(IllegalArgumentException.class, () -> TradeProposal.create(
                "bruno", "bruno", "ad-1",
                new TargetAdSnapshot("bruno", "item-b", "card-b", true),
                List.of(offered("item-a")), List.of(requested()), null, null, NOW));
    }

    @Test
    void rejectsWrongAnchor() {
        TradeProposalItem wrong = new TradeProposalItem("item-c", "card-b", "ad-1", 1, card("card-b"));
        assertThrows(IllegalArgumentException.class, () -> TradeProposal.create(
                "alice", "bruno", "ad-1",
                new TargetAdSnapshot("bruno", "item-b", "card-b", true),
                List.of(offered("item-a")), List.of(wrong), null, null, NOW));
    }

    @Test
    void rejectsDuplicateOfferedItems() {
        assertThrows(IllegalArgumentException.class, () -> TradeProposal.create(
                "alice", "bruno", "ad-1",
                new TargetAdSnapshot("bruno", "item-b", "card-b", true),
                List.of(offered("item-a"), offered("item-a")),
                List.of(requested()), null, null, NOW));
    }

    @Test
    void rejectsInvalidQuantityAndCardSnapshot() {
        assertThrows(IllegalArgumentException.class, () -> new TradeProposalItem(
                "item-a", "card-a", null, 0, card("card-a")));
        assertThrows(IllegalArgumentException.class, () -> new TradeProposalItem(
                "item-a", "card-a", null, 1, card("card-b")));
    }

    @Test
    void rejectsAdjustmentWithUnrelatedParticipant() {
        FinancialAdjustment adjustment = new FinancialAdjustment(
                new BigDecimal("1.00"), "BRL", "alice", "carol");
        assertThrows(IllegalArgumentException.class, () -> create(adjustment));
    }
}
