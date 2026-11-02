package com.pitcc.service;

import com.pitcc.dto.CreateTradeProposalRequest;
import com.pitcc.dto.TradeFinancialAdjustmentPayer;
import com.pitcc.dto.TradeFinancialAdjustmentRequest;
import com.pitcc.dto.TradeOfferedItemRequest;
import com.pitcc.dto.TradeProposalResponse;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.exception.TradeProposalCreationException;
import com.pitcc.model.Ad;
import com.pitcc.model.AdStatus;
import com.pitcc.model.Card;
import com.pitcc.model.CardSnapshot;
import com.pitcc.model.CollectionItem;
import com.pitcc.model.FinancialAdjustment;
import com.pitcc.model.TargetAdSnapshot;
import com.pitcc.model.TradeProposal;
import com.pitcc.model.TradeProposalItem;
import com.pitcc.repository.AdRepository;
import com.pitcc.repository.CardRepository;
import com.pitcc.repository.CollectionItemRepository;
import com.pitcc.repository.TradeProposalRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * Cria uma proposta PENDING com snapshots confiaveis.
 * NAO reserva, transfere, bloqueia cartas ou cria transacao/pagamento.
 */
@Service
public class CreateTradeProposalService {
    private static final int MAX_OFFERED_ITEMS = 30;
    private static final BigDecimal MAX_ADJUSTMENT = new BigDecimal("999999.99");

    private final TradeProposalRepository proposalRepository;
    private final AdRepository adRepository;
    private final CollectionItemRepository collectionItemRepository;
    private final CardRepository cardRepository;

    public CreateTradeProposalService(
            TradeProposalRepository proposalRepository,
            AdRepository adRepository,
            CollectionItemRepository collectionItemRepository,
            CardRepository cardRepository
    ) {
        this.proposalRepository = proposalRepository;
        this.adRepository = adRepository;
        this.collectionItemRepository = collectionItemRepository;
        this.cardRepository = cardRepository;
    }

    public TradeProposalResponse create(String proposerId, CreateTradeProposalRequest request) {
        if (proposerId == null || proposerId.isBlank()) {
            throw new InvalidAuthenticationException();
        }
        if (request == null || request.adId() == null || request.adId().isBlank()) {
            throw TradeProposalCreationException.invalid("adId", "Selecione um anuncio de troca.");
        }

        validateShape(request);
        String requestKey = normalizeKey(request.requestKey());
        if (requestKey != null) {
            var existing = proposalRepository.findByProposerIdAndRequestKey(proposerId, requestKey);
            if (existing.isPresent()) {
                return reusedProposal(existing.get(), request);
            }
        }

        Ad ad = adRepository.findById(request.adId()).orElseThrow(() ->
                TradeProposalCreationException.missing("adId", "Anuncio nao encontrado."));
        if (ad.isCreationAborted() || ad.getStatus() != AdStatus.ACTIVE
                || !ad.isTradeEnabled() || ad.getRemainingQuantity() == null
                || ad.getRemainingQuantity() <= 0) {
            throw TradeProposalCreationException.conflict(
                    "adId", "O anuncio nao esta disponivel para receber propostas de troca.");
        }
        if (proposerId.equals(ad.getSellerId())) {
            throw TradeProposalCreationException.invalid(
                    "adId", "Voce nao pode propor uma troca com seu proprio anuncio.");
        }
        if (request.requestedQuantity() > ad.getRemainingQuantity()) {
            throw TradeProposalCreationException.conflict(
                    "requestedQuantity", "A quantidade solicitada excede os exemplares restantes do anuncio.");
        }

        // O destinatario e a posse do anuncio sao resolvidos no servidor.
        String recipientId = ad.getSellerId();
        CollectionItem targetItem = collectionItemRepository
                .findByIdAndUserId(ad.getCollectionItemId(), recipientId)
                .orElseThrow(() -> TradeProposalCreationException.conflict(
                        "adId", "A posse vinculada ao anuncio nao esta mais disponivel."));
        if (ad.getCardId() != null && !ad.getCardId().equals(targetItem.getCardId())) {
            throw TradeProposalCreationException.conflict(
                    "adId", "O anuncio possui uma referencia de carta inconsistente.");
        }
        // O campo Ad.cardId pode estar ausente em anuncios antigos: usar a posse confirmada.
        String requestedCardId = targetItem.getCardId();
        Card requestedCard = requireCard(requestedCardId);
        TradeProposalItem requested = new TradeProposalItem(
                targetItem.getId(), requestedCardId, ad.getId(), request.requestedQuantity(),
                snapshot(requestedCard, targetItem));

        List<TradeProposalItem> offered = new ArrayList<>();
        for (TradeOfferedItemRequest line : request.offeredItems()) {
            CollectionItem ownItem = collectionItemRepository
                    .findByIdAndUserId(line.collectionItemId(), proposerId)
                    .orElseThrow(() -> TradeProposalCreationException.missing(
                            "offeredItems", "Carta oferecida nao encontrada na sua colecao."));
            // Apenas checagem de posse/quantidade total; NAO valida ou reserva estoque livre.
            if (ownItem.getQuantity() == null || line.quantity() > ownItem.getQuantity()) {
                throw TradeProposalCreationException.invalid(
                        "offeredItems", "A quantidade oferecida excede seus exemplares cadastrados.");
            }
            Card ownCard = requireCard(ownItem.getCardId());
            offered.add(new TradeProposalItem(
                    ownItem.getId(), ownItem.getCardId(), null,
                    line.quantity(), snapshot(ownCard, ownItem)));
        }

        FinancialAdjustment adjustment = buildAdjustment(
                request.financialAdjustment(), proposerId, recipientId);

        TargetAdSnapshot adSnapshot = new TargetAdSnapshot(
                recipientId, targetItem.getId(), requestedCardId, true);
        TradeProposal proposal = TradeProposal.create(
                proposerId, recipientId, ad.getId(), adSnapshot, offered,
                List.of(requested), adjustment, requestKey, Instant.now());

        try {
            // insert em vez de save: nao altera nenhuma proposta ja existente.
            return TradeProposalResponse.from(proposalRepository.insert(proposal));
        } catch (DuplicateKeyException duplicate) {
            // Dois envios concorrentes com a mesma chave: recuperar a primeira criacao.
            if (requestKey != null) {
                return proposalRepository.findByProposerIdAndRequestKey(proposerId, requestKey)
                        .map(saved -> reusedProposal(saved, request))
                        .orElseThrow(() -> TradeProposalCreationException.conflict(
                                "requestKey", "O envio anterior ainda esta sendo confirmado. Consulte antes de reenviar."));
            }
            throw duplicate;
        }
    }

    private static void validateShape(CreateTradeProposalRequest request) {
        if (request.requestedQuantity() == null || request.requestedQuantity() <= 0) {
            throw TradeProposalCreationException.invalid("requestedQuantity", "Informe uma quantidade positiva.");
        }
        if (request.offeredItems() == null || request.offeredItems().isEmpty()
                || request.offeredItems().size() > MAX_OFFERED_ITEMS) {
            throw TradeProposalCreationException.invalid("offeredItems", "Selecione de 1 a 30 itens da sua colecao.");
        }
        Set<String> ids = new HashSet<>();
        for (TradeOfferedItemRequest line : request.offeredItems()) {
            if (line == null || line.collectionItemId() == null
                    || line.collectionItemId().isBlank() || line.quantity() == null || line.quantity() <= 0) {
                throw TradeProposalCreationException.invalid(
                        "offeredItems", "Cada carta oferecida exige identificador e quantidade positiva.");
            }
            if (!ids.add(line.collectionItemId())) {
                throw TradeProposalCreationException.invalid(
                        "offeredItems", "Nao repita o mesmo item da colecao na proposta.");
            }
        }
        if (request.financialAdjustment() != null) {
            TradeFinancialAdjustmentRequest value = request.financialAdjustment();
            if (value.payer() == null || value.amount() == null
                    || value.amount().signum() <= 0 || value.amount().scale() > 2
                    || value.amount().compareTo(MAX_ADJUSTMENT) > 0) {
                throw TradeProposalCreationException.invalid(
                        "financialAdjustment", "Informe complemento positivo, pagador e ate duas casas decimais.");
            }
        }
    }

    private Card requireCard(String cardId) {
        if (cardId == null || cardId.isBlank()) {
            throw TradeProposalCreationException.conflict("cardId", "Item sem carta valida no catalogo.");
        }
        return cardRepository.findById(cardId).orElseThrow(() ->
                TradeProposalCreationException.conflict(
                        "cardId", "Uma carta da proposta nao foi encontrada no catalogo."));
    }

    private static CardSnapshot snapshot(Card card, CollectionItem item) {
        return new CardSnapshot(
                item.getCardId(), card.getName(), card.getGame(), card.getEdition(),
                card.getCardNumber(), card.getImageUrl(), item.getCondition(), item.getLanguage());
    }

    private static FinancialAdjustment buildAdjustment(
            TradeFinancialAdjustmentRequest request, String proposerId, String recipientId) {
        if (request == null) return null;
        String payer = request.payer() == TradeFinancialAdjustmentPayer.PROPOSER
                ? proposerId : recipientId;
        String payee = payer.equals(proposerId) ? recipientId : proposerId;
        return new FinancialAdjustment(request.amount(), "BRL", payer, payee);
    }

    private static String normalizeKey(String key) {
        if (key == null || key.isBlank()) return null;
        String normalized = key.strip();
        if (normalized.length() > 100) {
            throw TradeProposalCreationException.invalid("requestKey", "A chave de envio e muito longa.");
        }
        return normalized;
    }

    private static TradeProposalResponse reusedProposal(
            TradeProposal existing, CreateTradeProposalRequest request) {
        if (!matches(existing, request)) {
            throw TradeProposalCreationException.conflict(
                    "requestKey", "Esta chave de envio ja foi utilizada para outra proposta.");
        }
        return TradeProposalResponse.from(existing);
    }

    private static boolean matches(TradeProposal existing, CreateTradeProposalRequest request) {
        if (!Objects.equals(existing.getAdId(), request.adId())
                || request.requestedQuantity() == null || existing.getRequestedItems().size() != 1
                || existing.getRequestedItems().getFirst().getQuantity() != request.requestedQuantity()
                || request.offeredItems() == null
                || existing.getOfferedItems().size() != request.offeredItems().size()) {
            return false;
        }
        Map<String, Integer> offered = new HashMap<>();
        for (TradeProposalItem item : existing.getOfferedItems()) {
            offered.put(item.getCollectionItemId(), item.getQuantity());
        }
        for (TradeOfferedItemRequest line : request.offeredItems()) {
            if (line == null || !Objects.equals(offered.remove(line.collectionItemId()), line.quantity())) {
                return false;
            }
        }
        if (!offered.isEmpty()) return false;
        if (request.financialAdjustment() == null) return existing.getFinancialAdjustment() == null;
        FinancialAdjustment saved = existing.getFinancialAdjustment();
        if (saved == null || request.financialAdjustment().amount() == null
                || request.financialAdjustment().payer() == null) return false;
        String expectedPayer = request.financialAdjustment().payer() == TradeFinancialAdjustmentPayer.PROPOSER
                ? existing.getProposerId() : existing.getRecipientId();
        return saved.getAmount().compareTo(request.financialAdjustment().amount()) == 0
                && expectedPayer.equals(saved.getPayerId());
    }
}
