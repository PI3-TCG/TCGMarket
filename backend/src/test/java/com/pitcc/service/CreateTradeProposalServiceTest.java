package com.pitcc.service;

import com.pitcc.dto.CreateTradeProposalRequest;
import com.pitcc.dto.TradeFinancialAdjustmentPayer;
import com.pitcc.dto.TradeFinancialAdjustmentRequest;
import com.pitcc.dto.TradeOfferedItemRequest;
import com.pitcc.dto.TradeProposalResponse;
import com.pitcc.exception.TradeProposalCreationException;
import com.pitcc.model.Ad;
import com.pitcc.model.Card;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CollectionItem;
import com.pitcc.model.TradeProposal;
import com.pitcc.model.TradeProposalEventType;
import com.pitcc.model.TradeProposalStatus;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.CollectionItemRepository;
import com.pitcc.repository.TradeProposalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreateTradeProposalServiceTest {
    @Mock TradeProposalRepository proposalRepository;
    @Mock AdRepository adRepository;
    @Mock CollectionItemRepository collectionItemRepository;
    @Mock CardRepository cardRepository;

    private CreateTradeProposalService service;
    private Ad ad;

    @BeforeEach
    void setUp() {
        service = new CreateTradeProposalService(
                proposalRepository, adRepository, collectionItemRepository, cardRepository);
    }

    private CollectionItem item(String owner, String id, String cardId, int quantity) {
        CollectionItem item = new CollectionItem(owner, cardId, quantity,
                CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
        ReflectionTestUtils.setField(item, "id", id);
        return item;
    }

    private void stubCard(String cardId) {
        Card card = mock(Card.class);
        when(card.getName()).thenReturn("Carta " + cardId);
        when(card.getGame()).thenReturn(CardGame.POKEMON);
        when(card.getEdition()).thenReturn("Edicao");
        when(cardRepository.findById(cardId)).thenReturn(Optional.of(card));
    }

    private void stubValid() {
        CollectionItem target = item("recipient", "target-item", "target-card", 3);
        ad = new Ad("ad-1", "recipient", target, 2, false, true, null, Instant.now());
        when(adRepository.findById("ad-1")).thenReturn(Optional.of(ad));
        when(collectionItemRepository.findByIdAndUserId("target-item", "recipient"))
                .thenReturn(Optional.of(target));
        stubCard("target-card");

        CollectionItem offered1 = item("proposer", "offer-1", "card-1", 4);
        CollectionItem offered2 = item("proposer", "offer-2", "card-2", 5);
        when(collectionItemRepository.findByIdAndUserId("offer-1", "proposer"))
                .thenReturn(Optional.of(offered1));
        when(collectionItemRepository.findByIdAndUserId("offer-2", "proposer"))
                .thenReturn(Optional.of(offered2));
        stubCard("card-1");
        stubCard("card-2");
        when(proposalRepository.insert(any(TradeProposal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    private CreateTradeProposalRequest validRequest() {
        return new CreateTradeProposalRequest(
                "ad-1", 1,
                List.of(new TradeOfferedItemRequest("offer-1", 2),
                        new TradeOfferedItemRequest("offer-2", 1)),
                null, null);
    }

    @Test
    void createsPendingProposalWithSnapshotsAndNoTransferOrReservation() {
        stubValid();
        TradeProposalResponse response = service.create("proposer", validRequest());

        assertNotNull(response.id());
        assertEquals(TradeProposalStatus.PENDING, response.status());
        assertEquals("recipient", response.recipientId());
        assertEquals(2, response.offeredItems().size());
        assertEquals(1, response.requestedItems().size());
        assertEquals("ad-1", response.requestedItems().getFirst().getSourceAdId());
        assertEquals("Carta card-1", response.offeredItems().getFirst().getCard().getName());
        assertNull(response.financialAdjustment());

        ArgumentCaptor<TradeProposal> saved = ArgumentCaptor.forClass(TradeProposal.class);
        verify(proposalRepository).insert(saved.capture());
        assertEquals(1, saved.getValue().getEvents().size());
        assertEquals(TradeProposalEventType.CREATED, saved.getValue().getEvents().getFirst().getEventType());
        verify(collectionItemRepository, never()).save(any());
        verify(adRepository, never()).save(any());
    }

    @Test
    void recordsOptionalFinancialAdjustmentWithoutPayment() {
        stubValid();
        CreateTradeProposalRequest original = validRequest();
        CreateTradeProposalRequest request = new CreateTradeProposalRequest(
                original.adId(), original.requestedQuantity(), original.offeredItems(),
                new TradeFinancialAdjustmentRequest(new BigDecimal("25.50"),
                        TradeFinancialAdjustmentPayer.RECIPIENT), null);

        TradeProposalResponse response = service.create("proposer", request);
        assertEquals("recipient", response.financialAdjustment().getPayerId());
        assertEquals("proposer", response.financialAdjustment().getPayeeId());
        assertEquals("BRL", response.financialAdjustment().getCurrency());
    }

    @Test
    void rejectsOwnAd() {
        CollectionItem own = item("proposer", "target-item", "target-card", 2);
        Ad ownAd = new Ad("ad-1", "proposer", own, 1, false, true, null, Instant.now());
        when(adRepository.findById("ad-1")).thenReturn(Optional.of(ownAd));
        var thrown = assertThrows(TradeProposalCreationException.class,
                () -> service.create("proposer", validRequest()));
        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatus());
        verify(proposalRepository, never()).insert(any(TradeProposal.class));
    }

    @Test
    void rejectsAdWithoutTradeModality() {
        CollectionItem target = item("recipient", "target-item", "target-card", 2);
        Ad saleOnly = new Ad("ad-1", "recipient", target, 1,
                true, false, new BigDecimal("20.00"), Instant.now());
        when(adRepository.findById("ad-1")).thenReturn(Optional.of(saleOnly));

        var thrown = assertThrows(TradeProposalCreationException.class,
                () -> service.create("proposer", validRequest()));
        assertEquals(HttpStatus.CONFLICT, thrown.getStatus());
    }

    @Test
    void rejectsNonexistentAd() {
        when(adRepository.findById("ad-1")).thenReturn(Optional.empty());
        var thrown = assertThrows(TradeProposalCreationException.class,
                () -> service.create("proposer", validRequest()));
        assertEquals(HttpStatus.NOT_FOUND, thrown.getStatus());
    }

    @Test
    void rejectsRequestedQuantityBeyondAdRemaining() {
        CollectionItem target = item("recipient", "target-item", "target-card", 2);
        when(adRepository.findById("ad-1")).thenReturn(Optional.of(
                new Ad("ad-1", "recipient", target, 1, false, true, null, Instant.now())));
        var req = new CreateTradeProposalRequest("ad-1", 2,
                validRequest().offeredItems(), null, null);
        var thrown = assertThrows(TradeProposalCreationException.class,
                () -> service.create("proposer", req));
        assertEquals(HttpStatus.CONFLICT, thrown.getStatus());
    }

    @Test
    void rejectsDuplicateOfferedCollectionItems() {
        var req = new CreateTradeProposalRequest("ad-1", 1,
                List.of(new TradeOfferedItemRequest("offer-1", 1),
                        new TradeOfferedItemRequest("offer-1", 2)), null, null);
        var thrown = assertThrows(TradeProposalCreationException.class,
                () -> service.create("proposer", req));
        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatus());
        verifyNoInteractions(adRepository);
    }

    @Test
    void rejectsItemFromSomeoneElsesCollection() {
        CollectionItem target = item("recipient", "target-item", "target-card", 2);
        when(adRepository.findById("ad-1")).thenReturn(Optional.of(
                new Ad("ad-1", "recipient", target, 1, false, true, null, Instant.now())));
        when(collectionItemRepository.findByIdAndUserId("target-item", "recipient"))
                .thenReturn(Optional.of(target));
        stubCard("target-card");
        when(collectionItemRepository.findByIdAndUserId("offer-1", "proposer"))
                .thenReturn(Optional.empty());

        var thrown = assertThrows(TradeProposalCreationException.class,
                () -> service.create("proposer", validRequest()));
        assertEquals(HttpStatus.NOT_FOUND, thrown.getStatus());
        verify(proposalRepository, never()).insert(any(TradeProposal.class));
    }

    @Test
    void rejectsQuantityGreaterThanRegisteredOwnership() {
        CollectionItem target = item("recipient", "target-item", "target-card", 2);
        when(adRepository.findById("ad-1")).thenReturn(Optional.of(
                new Ad("ad-1", "recipient", target, 1, false, true, null, Instant.now())));
        when(collectionItemRepository.findByIdAndUserId("target-item", "recipient"))
                .thenReturn(Optional.of(target));
        stubCard("target-card");
        when(collectionItemRepository.findByIdAndUserId("offer-1", "proposer"))
                .thenReturn(Optional.of(item("proposer", "offer-1", "card-1", 1)));
        var thrown = assertThrows(TradeProposalCreationException.class,
                () -> service.create("proposer", validRequest()));
        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatus());
    }

    @Test
    void reusesIdenticalProposalWhenRequestKeyAlreadyExists() {
        var saved = TradeProposal.create("proposer", "recipient", "ad-1",
                new com.pitcc.model.TargetAdSnapshot("recipient", "target-item", "target-card", true),
                List.of(
                        new com.pitcc.model.TradeProposalItem("offer-1", "card-1", null, 2,
                                new com.pitcc.model.CardSnapshot("card-1", "Carta", CardGame.POKEMON,
                                        "Ed", "001", null, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE)),
                        new com.pitcc.model.TradeProposalItem("offer-2", "card-2", null, 1,
                                new com.pitcc.model.CardSnapshot("card-2", "Carta", CardGame.POKEMON,
                                        "Ed", "002", null, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE))),
                List.of(new com.pitcc.model.TradeProposalItem("target-item", "target-card", "ad-1", 1,
                        new com.pitcc.model.CardSnapshot("target-card", "Carta", CardGame.POKEMON,
                                "Ed", "003", null, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE))),
                null, "key-1", Instant.now());
        when(proposalRepository.findByProposerIdAndRequestKey("proposer", "key-1"))
                .thenReturn(Optional.of(saved));

        var request = new CreateTradeProposalRequest("ad-1", 1, validRequest().offeredItems(), null, "key-1");
        var response = service.create("proposer", request);
        assertEquals(saved.getId(), response.id());
        verifyNoInteractions(adRepository, collectionItemRepository, cardRepository);
        verify(proposalRepository, never()).insert(any(TradeProposal.class));
    }

    @Test
    void rejectsChangedTermsWithReusedRequestKey() {
        var saved = TradeProposal.create("proposer", "recipient", "ad-1",
                new com.pitcc.model.TargetAdSnapshot("recipient", "target-item", "target-card", true),
                List.of(new com.pitcc.model.TradeProposalItem("offer-1", "card-1", null, 1,
                        new com.pitcc.model.CardSnapshot("card-1", "Carta", CardGame.POKEMON,
                                "Ed", "001", null, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE))),
                List.of(new com.pitcc.model.TradeProposalItem("target-item", "target-card", "ad-1", 1,
                        new com.pitcc.model.CardSnapshot("target-card", "Carta", CardGame.POKEMON,
                                "Ed", "003", null, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE))),
                null, "key-1", Instant.now());
        when(proposalRepository.findByProposerIdAndRequestKey("proposer", "key-1"))
                .thenReturn(Optional.of(saved));
        var request = new CreateTradeProposalRequest("ad-1", 1, validRequest().offeredItems(), null, "key-1");
        var thrown = assertThrows(TradeProposalCreationException.class,
                () -> service.create("proposer", request));
        assertEquals(HttpStatus.CONFLICT, thrown.getStatus());
    }
}
