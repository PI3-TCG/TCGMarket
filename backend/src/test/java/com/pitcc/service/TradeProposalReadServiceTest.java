package com.pitcc.service;

import com.pitcc.dto.TradeFinancialAdjustmentPayer;
import com.pitcc.dto.TradeProposalDirection;
import com.pitcc.dto.TradeProposalViewResponse;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.exception.TradeProposalNotFoundException;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CardSnapshot;
import com.pitcc.model.FinancialAdjustment;
import com.pitcc.model.TargetAdSnapshot;
import com.pitcc.model.TradeProposal;
import com.pitcc.model.TradeProposalItem;
import com.pitcc.model.TradeProposalStatus;
import com.pitcc.model.User;
import com.pitcc.repository.TradeProposalRepository;
import com.pitcc.repository.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TradeProposalReadServiceTest {
    @Mock TradeProposalRepository proposals;
    @Mock UserRepository users;
    TradeProposalReadService service;

    @BeforeEach
    void setup() {
        service = new TradeProposalReadService(proposals, users);
    }

    private static User user(String id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setName("Jogador " + username);
        user.setEmail("privado@example.com");
        user.setPasswordHash("nao-deve-sair-na-api");
        return user;
    }

    private static TradeProposalItem item(String id, String cardId, String adId, int qty) {
        CardSnapshot snapshot = new CardSnapshot(cardId, "Carta " + cardId,
                CardGame.POKEMON, "Edicao 1", "007", "https://cards.example/test.jpg",
                CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
        return new TradeProposalItem(id, cardId, adId, qty, snapshot);
    }

    private static TradeProposal proposal(boolean withAdjustment) {
        return TradeProposal.create("alice", "bob", "ad-1",
                new TargetAdSnapshot("bob", "target-1", "target-card", true),
                List.of(item("offer-1", "offered-card", null, 2),
                        item("offer-2", "second-card", null, 1)),
                List.of(item("target-1", "target-card", "ad-1", 1)),
                withAdjustment
                        ? new FinancialAdjustment(new BigDecimal("25.50"), "BRL", "bob", "alice")
                        : null,
                "private-request-key", Instant.parse("2026-11-01T12:00:00Z"));
    }

    @Test
    void sentProposalReturnsSnapshotsPublicParticipantsAndAdjustment() {
        TradeProposal saved = proposal(true);
        when(proposals.findByProposerId(eq("alice"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(saved), PageRequest.of(0, 10), 1));
        when(users.findAllById(any())).thenReturn(List.of(user("alice", "aline"), user("bob", "caelus")));

        Page<TradeProposalViewResponse> page = service.findOwnProposals("alice", "sent", null, 0, 10);
        TradeProposalViewResponse view = page.getContent().getFirst();

        assertEquals(TradeProposalDirection.SENT, view.direction());
        assertEquals("caelus", view.recipient().username());
        assertEquals("Jogador aline", view.proposer().name());
        assertEquals("Carta offered-card", view.offeredItems().getFirst().name());
        assertEquals(2, view.offeredItems().getFirst().quantity());
        assertEquals(1, view.requestedItems().getFirst().quantity());
        assertEquals(0, new BigDecimal("25.50").compareTo(view.financialAdjustment().amount()));
        assertEquals(TradeFinancialAdjustmentPayer.RECIPIENT, view.financialAdjustment().payer());
        assertEquals(TradeProposalStatus.PENDING, view.status());
        assertEquals(1, view.events().size());
        assertEquals(TradeFinancialAdjustmentPayer.PROPOSER, view.events().getFirst().actor());
        verify(proposals, never()).save(any());
    }

    @Test
    void receivedStatusFilterUsesRecipientOnly() {
        TradeProposal saved = proposal(false);
        ReflectionTestUtils.setField(saved, "status", TradeProposalStatus.REJECTED);
        when(proposals.findByRecipientIdAndStatus(eq("bob"), eq(TradeProposalStatus.REJECTED), any()))
                .thenReturn(new PageImpl<>(List.of(saved)));
        when(users.findAllById(any())).thenReturn(List.of(user("alice", "aline"), user("bob", "caelus")));

        var page = service.findOwnProposals("bob", "received", TradeProposalStatus.REJECTED, 0, 10);
        assertEquals(TradeProposalDirection.RECEIVED, page.getContent().getFirst().direction());
        assertEquals(TradeProposalStatus.REJECTED, page.getContent().getFirst().status());
        verify(proposals, never()).findByProposerId(anyString(), any());
    }

    @Test
    void receivedWithoutStatusUsesRecipientFilter() {
        when(proposals.findByRecipientId(eq("bob"), any(Pageable.class)))
                .thenReturn(Page.empty());
        assertTrue(service.findOwnProposals("bob", "received", null, 0, 10).isEmpty());
        verifyNoInteractions(users);
    }

    @Test
    void detailsOnlyAllowParticipants() {
        TradeProposal saved = proposal(true);
        when(proposals.findById(saved.getId())).thenReturn(Optional.of(saved));
        when(users.findAllById(any())).thenReturn(List.of(user("alice", "aline"), user("bob", "caelus")));
        assertEquals(TradeProposalDirection.RECEIVED,
                service.findOwnProposal("bob", saved.getId()).direction());
        assertEquals(TradeProposalDirection.SENT,
                service.findOwnProposal("alice", saved.getId()).direction());
    }

    @Test
    void thirdPartyCannotAccessEvenWithKnownId() {
        TradeProposal saved = proposal(false);
        when(proposals.findById(saved.getId())).thenReturn(Optional.of(saved));
        assertThrows(TradeProposalNotFoundException.class,
                () -> service.findOwnProposal("mallory", saved.getId()));
        verifyNoInteractions(users);
    }

    @Test
    void absentAndBlankIdReturnSameNotFound() {
        when(proposals.findById("unknown")).thenReturn(Optional.empty());
        assertThrows(TradeProposalNotFoundException.class,
                () -> service.findOwnProposal("alice", "unknown"));
        assertThrows(TradeProposalNotFoundException.class,
                () -> service.findOwnProposal("alice", " "));
    }

    @Test
    void missingUserAndInvalidPaginationAreRejectedBeforeDatabaseQueries() {
        assertThrows(InvalidAuthenticationException.class,
                () -> service.findOwnProposals(" ", "sent", null, 0, 10));
        assertThrows(IllegalArgumentException.class,
                () -> service.findOwnProposals("alice", "both", null, 0, 10));
        assertThrows(IllegalArgumentException.class,
                () -> service.findOwnProposals("alice", "sent", null, -1, 10));
        assertThrows(IllegalArgumentException.class,
                () -> service.findOwnProposals("alice", "sent", null, 0, 21));
        assertThrows(IllegalArgumentException.class,
                () -> service.findOwnProposals("alice", "sent", null, 0, 0));
        verifyNoInteractions(proposals, users);
    }

    @Test
    void deletedPublicProfileDoesNotBreakProposalHistory() {
        TradeProposal saved = proposal(false);
        when(proposals.findById(saved.getId())).thenReturn(Optional.of(saved));
        when(users.findAllById(any())).thenReturn(List.of());
        var response = service.findOwnProposal("alice", saved.getId());
        assertEquals("bob", response.recipient().id());
        assertNull(response.recipient().username());
        assertEquals("Carta offered-card", response.offeredItems().getFirst().name());
        assertNull(response.financialAdjustment());
    }
}
