package com.pitcc.service;

import com.pitcc.dto.TransactionHistoryResponse;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.exception.TransactionNotFoundException;
import com.pitcc.model.CardSnapshot;
import com.pitcc.model.FinancialAdjustment;
import com.pitcc.model.Transaction;
import com.pitcc.model.TransactionItem;
import com.pitcc.model.TransactionType;
import com.pitcc.model.User;
import com.pitcc.repository.TransactionRepository;
import com.pitcc.repository.UserRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Histórico de compras, vendas e trocas do usuário autenticado. Lê apenas o que foi
 * copiado para a transação na conclusão, nunca o anúncio ou o pedido atuais.
 */
@Service
public class TransactionHistoryService {

    private static final int MAX_PAGE_SIZE = 20;

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionHistoryService(
            TransactionRepository transactionRepository,
            UserRepository userRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public Page<TransactionHistoryResponse> findOwnTransactions(
            String userId,
            TransactionHistoryResponse.Type type,
            int page,
            int size
    ) {
        requireUser(userId);

        if (page < 0) {
            throw new IllegalArgumentException("A página não pode ser negativa.");
        }

        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException(
                    "O tamanho da página deve estar entre 1 e 20."
            );
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactions = type == null
                ? transactionRepository.findByBuyerIdOrSellerIdOrderByCompletedAtDesc(
                        userId, userId, pageable)
                : switch (type) {
                    case PURCHASE -> transactionRepository
                            .findByTypeAndBuyerIdOrderByCompletedAtDesc(TransactionType.SALE, userId, pageable);
                    case SALE -> transactionRepository
                            .findByTypeAndSellerIdOrderByCompletedAtDesc(TransactionType.SALE, userId, pageable);
                    case TRADE -> transactionRepository
                            .findByTypeAndBuyerIdOrTypeAndSellerIdOrderByCompletedAtDesc(
                                    TransactionType.TRADE, userId, TransactionType.TRADE, userId, pageable);
                };

        Set<String> counterpartyIds = transactions.stream()
                .map(transaction -> counterpartyId(transaction, userId))
                .collect(Collectors.toSet());
        Map<String, User> users = userRepository.findAllById(counterpartyIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return transactions.map(transaction -> toResponse(
                transaction,
                userId,
                users.get(counterpartyId(transaction, userId))
        ));
    }

    public TransactionHistoryResponse findOwnTransaction(String userId, String transactionId) {
        requireUser(userId);

        // Transação de terceiros responde como inexistente para não revelar que existe.
        Transaction transaction = transactionRepository.findById(transactionId)
                .filter(found -> isParticipant(found, userId))
                .orElseThrow(TransactionNotFoundException::new);

        User counterparty = userRepository
                .findById(counterpartyId(transaction, userId))
                .orElse(null);

        return toResponse(transaction, userId, counterparty);
    }

    private static boolean isParticipant(Transaction transaction, String userId) {
        return userId.equals(transaction.getBuyerId())
                || userId.equals(transaction.getSellerId());
    }

    private static String counterpartyId(Transaction transaction, String userId) {
        return userId.equals(transaction.getBuyerId())
                ? transaction.getSellerId()
                : transaction.getBuyerId();
    }

    private static TransactionHistoryResponse toResponse(
            Transaction transaction,
            String userId,
            User counterparty
    ) {
        boolean trade = transaction.getType() == TransactionType.TRADE;
        TransactionHistoryResponse.Type type = trade
                ? TransactionHistoryResponse.Type.TRADE
                : userId.equals(transaction.getBuyerId())
                        ? TransactionHistoryResponse.Type.PURCHASE
                        : TransactionHistoryResponse.Type.SALE;

        var items = transaction.getItems().stream()
                .map(item -> toItem(item, userId))
                .toList();

        return new TransactionHistoryResponse(
                transaction.getId(),
                type,
                TransactionHistoryResponse.Status.COMPLETED,
                transaction.getCompletedAt(),
                counterparty == null
                        ? null
                        : new TransactionHistoryResponse.Counterparty(
                                counterparty.getUsername(),
                                counterparty.getName()
                        ),
                items,
                items.stream().mapToInt(TransactionHistoryResponse.Item::quantity).sum(),
                transaction.getTotalAmount(),
                toFinancialAdjustment(transaction.getFinancialAdjustment(), userId),
                trade ? transaction.getSourceId() : null
        );
    }

    private static TransactionHistoryResponse.FinancialAdjustment toFinancialAdjustment(
            FinancialAdjustment adjustment,
            String userId
    ) {
        if (adjustment == null) {
            return null;
        }
        return new TransactionHistoryResponse.FinancialAdjustment(
                adjustment.getAmount(),
                adjustment.getCurrency(),
                direction(userId.equals(adjustment.getPayerId()))
        );
    }

    private static TransactionHistoryResponse.Direction direction(boolean sentByUser) {
        return sentByUser
                ? TransactionHistoryResponse.Direction.SENT
                : TransactionHistoryResponse.Direction.RECEIVED;
    }

    private static TransactionHistoryResponse.Item toItem(TransactionItem item, String userId) {
        CardSnapshot card = item.getCard();

        return new TransactionHistoryResponse.Item(
                card.getCardId(),
                card.getName(),
                card.getGame(),
                card.getEdition(),
                card.getCardNumber(),
                card.getImageUrl(),
                card.getCondition(),
                card.getLanguage(),
                item.getQuantity(),
                item.getUnitPrice(),
                direction(userId.equals(item.getFromUserId()))
        );
    }

    private static void requireUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new InvalidAuthenticationException();
        }
    }
}
