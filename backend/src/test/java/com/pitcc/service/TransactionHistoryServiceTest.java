package com.pitcc.service;

import com.pitcc.dto.TransactionHistoryResponse;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.exception.TransactionNotFoundException;
import com.pitcc.model.Order;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CardSnapshot;
import com.pitcc.model.FinancialAdjustment;
import com.pitcc.model.TargetAdSnapshot;
import com.pitcc.model.TradeProposal;
import com.pitcc.model.TradeProposalItem;
import com.pitcc.model.TradeProposalStatus;
import com.pitcc.model.Transaction;
import com.pitcc.model.TransactionType;
import com.pitcc.model.User;
import com.pitcc.repository.TransactionRepository;
import com.pitcc.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionHistoryServiceTest {

    private static final String BUYER = PaymentFixtures.BUYER;
    private static final String SELLER = "seller-1";

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TransactionHistoryService service;

    @Test
    void buyerSeesSaleAsPurchaseWithSellerAsCounterparty() {
        Transaction transaction = transaction("tx-1");
        when(transactionRepository.findByBuyerIdOrSellerIdOrderByCompletedAtDesc(
                eq(BUYER), eq(BUYER), any()))
                .thenReturn(new PageImpl<>(List.of(transaction), PageRequest.of(0, 10), 1));
        when(userRepository.findAllById(any())).thenReturn(List.of(user(SELLER, "vendedor")));

        Page<TransactionHistoryResponse> page = service.findOwnTransactions(BUYER, null, 0, 10);

        TransactionHistoryResponse response = page.getContent().getFirst();
        assertEquals(TransactionHistoryResponse.Type.PURCHASE, response.type());
        assertEquals(TransactionHistoryResponse.Status.COMPLETED, response.status());
        assertEquals("vendedor", response.counterparty().username());
        assertEquals(3, response.totalQuantity());
        assertEquals(0, new BigDecimal("25.00").compareTo(response.totalAmount()));
        assertEquals("Dark Magician", response.items().getFirst().name());
        assertEquals(2, response.items().getFirst().quantity());
    }

    @Test
    void sellerSeesSameTransactionAsSale() {
        when(transactionRepository.findByTypeAndSellerIdOrderByCompletedAtDesc(eq(TransactionType.SALE), eq(SELLER), any()))
                .thenReturn(new PageImpl<>(List.of(transaction("tx-1"))));
        when(userRepository.findAllById(any())).thenReturn(List.of(user(BUYER, "comprador")));

        TransactionHistoryResponse response = service
                .findOwnTransactions(SELLER, TransactionHistoryResponse.Type.SALE, 0, 10)
                .getContent()
                .getFirst();

        assertEquals(TransactionHistoryResponse.Type.SALE, response.type());
        assertEquals("comprador", response.counterparty().username());
    }

    @Test
    void purchaseFilterOnlyQueriesTransactionsWhereUserIsBuyer() {
        when(transactionRepository.findByTypeAndBuyerIdOrderByCompletedAtDesc(eq(TransactionType.SALE), eq(BUYER), any()))
                .thenReturn(Page.empty());

        service.findOwnTransactions(BUYER, TransactionHistoryResponse.Type.PURCHASE, 0, 10);

        verify(transactionRepository).findByTypeAndBuyerIdOrderByCompletedAtDesc(eq(TransactionType.SALE), eq(BUYER), any());
        verify(transactionRepository, never()).findByTypeAndSellerIdOrderByCompletedAtDesc(any(), anyString(), any());
    }

    @Test
    void deletedCounterpartyDoesNotBreakHistory() {
        when(transactionRepository.findById("tx-1")).thenReturn(Optional.of(transaction("tx-1")));
        when(userRepository.findById(SELLER)).thenReturn(Optional.empty());

        TransactionHistoryResponse response = service.findOwnTransaction(BUYER, "tx-1");

        assertNull(response.counterparty());
    }

    @Test
    void thirdPartyCannotSeeTransaction() {
        when(transactionRepository.findById("tx-1")).thenReturn(Optional.of(transaction("tx-1")));

        assertThrows(TransactionNotFoundException.class,
                () -> service.findOwnTransaction("intruder", "tx-1"));
        verifyNoInteractions(userRepository);
    }

    @Test
    void missingTransactionIsNotFound() {
        when(transactionRepository.findById("tx-404")).thenReturn(Optional.empty());

        assertThrows(TransactionNotFoundException.class,
                () -> service.findOwnTransaction(BUYER, "tx-404"));
    }

    @Test
    void rejectsInvalidPaginationAndMissingUser() {
        assertThrows(IllegalArgumentException.class,
                () -> service.findOwnTransactions(BUYER, null, -1, 10));
        assertThrows(IllegalArgumentException.class,
                () -> service.findOwnTransactions(BUYER, null, 0, 21));
        assertThrows(InvalidAuthenticationException.class,
                () -> service.findOwnTransactions(" ", null, 0, 10));
        verifyNoInteractions(transactionRepository);
    }

    @Test
    void eachParticipantSeesTheTradeFromTheirOwnSide() {
        Transaction trade = trade("tx-trade");
        when(transactionRepository.findById("tx-trade")).thenReturn(Optional.of(trade));
        when(userRepository.findById(any())).thenReturn(Optional.empty());

        TransactionHistoryResponse proposerView = service.findOwnTransaction(BUYER, "tx-trade");
        TransactionHistoryResponse recipientView = service.findOwnTransaction(SELLER, "tx-trade");

        assertEquals(TransactionHistoryResponse.Type.TRADE, proposerView.type());
        assertEquals(TransactionHistoryResponse.Type.TRADE, recipientView.type());
        assertEquals("proposal-1", proposerView.tradeProposalId());
        assertNull(proposerView.totalAmount());
        assertEquals(5, proposerView.totalQuantity());

        TransactionHistoryResponse.Item given = proposerView.items().getFirst();
        assertEquals("card-offered", given.cardId());
        assertEquals(TransactionHistoryResponse.Direction.SENT, given.direction());
        assertEquals(4, given.quantity());
        assertEquals(TransactionHistoryResponse.Direction.RECEIVED, proposerView.items().get(1).direction());
        assertEquals(TransactionHistoryResponse.Direction.RECEIVED, recipientView.items().getFirst().direction());

        assertEquals(TransactionHistoryResponse.Direction.SENT, proposerView.financialAdjustment().direction());
        assertEquals(TransactionHistoryResponse.Direction.RECEIVED, recipientView.financialAdjustment().direction());
        assertEquals(0, new BigDecimal("12.00").compareTo(recipientView.financialAdjustment().amount()));
    }

    @Test
    void tradeFilterQueriesOnlyTradesWhereUserParticipates() {
        when(transactionRepository.findByTypeAndBuyerIdOrTypeAndSellerIdOrderByCompletedAtDesc(
                eq(TransactionType.TRADE), eq(SELLER), eq(TransactionType.TRADE), eq(SELLER), any()))
                .thenReturn(new PageImpl<>(List.of(trade("tx-trade"))));
        when(userRepository.findAllById(any())).thenReturn(List.of(user(BUYER, "proponente")));

        TransactionHistoryResponse response = service
                .findOwnTransactions(SELLER, TransactionHistoryResponse.Type.TRADE, 0, 10)
                .getContent()
                .getFirst();

        assertEquals(TransactionHistoryResponse.Type.TRADE, response.type());
        assertEquals("proponente", response.counterparty().username());
    }

    @Test
    void saleHasNoTradeDetails() {
        when(transactionRepository.findById("tx-1")).thenReturn(Optional.of(transaction("tx-1")));
        when(userRepository.findById(SELLER)).thenReturn(Optional.empty());

        TransactionHistoryResponse response = service.findOwnTransaction(BUYER, "tx-1");

        assertNull(response.financialAdjustment());
        assertNull(response.tradeProposalId());
        assertEquals(TransactionHistoryResponse.Direction.RECEIVED, response.items().getFirst().direction());
    }

    private static Transaction trade(String id) {
        TradeProposal proposal = TradeProposal.create(
                BUYER, SELLER, "ad-1",
                new TargetAdSnapshot(SELLER, "item-anchor", "card-anchor", true),
                List.of(tradeLine("item-offered", "card-offered", null, 4)),
                List.of(tradeLine("item-anchor", "card-anchor", "ad-1", 1)),
                new FinancialAdjustment(new BigDecimal("12.00"), "BRL", BUYER, SELLER),
                null,
                Instant.now());
        ReflectionTestUtils.setField(proposal, "id", "proposal-1");
        ReflectionTestUtils.setField(proposal, "status", TradeProposalStatus.ACCEPTED);
        Transaction transaction = Transaction.fromAcceptedTrade(proposal, Instant.now());
        ReflectionTestUtils.setField(transaction, "id", id);
        return transaction;
    }

    private static TradeProposalItem tradeLine(String itemId, String cardId, String adId, int quantity) {
        return new TradeProposalItem(itemId, cardId, adId, quantity, new CardSnapshot(
                cardId, cardId, CardGame.POKEMON, "Base", "1", null,
                CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE));
    }

    private static Transaction transaction(String id) {
        Order order = PaymentFixtures.order("order-1");
        order.markPaid(Instant.now());
        Transaction transaction = Transaction.fromPaidOrder(order, Instant.now());
        ReflectionTestUtils.setField(transaction, "id", id);
        return transaction;
    }

    private static User user(String id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setName("Nome " + username);
        return user;
    }
}
