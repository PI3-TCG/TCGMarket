package com.pitcc.service;

import com.pitcc.dto.TradeFinancialAdjustmentPayer;
import com.pitcc.dto.TradeProposalDirection;
import com.pitcc.dto.TradeProposalViewResponse;
import com.pitcc.exception.InvalidAuthenticationException;
import com.pitcc.exception.TradeProposalNotFoundException;
import com.pitcc.model.CardSnapshot;
import com.pitcc.model.FinancialAdjustment;
import com.pitcc.model.TradeProposal;
import com.pitcc.model.TradeProposalEvent;
import com.pitcc.model.TradeProposalItem;
import com.pitcc.model.TradeProposalStatus;
import com.pitcc.model.User;
import com.pitcc.repository.TradeProposalRepository;
import com.pitcc.repository.UserRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

/**
 * Consultas de propostas para quem participa da negociacao. Nao atualiza
 * proposta, anuncio, colecao, pagamento ou historico de transacao.
 */
@Service
public class TradeProposalReadService {
    private static final int MAX_PAGE_SIZE = 20;
    private final TradeProposalRepository proposalRepository;
    private final UserRepository userRepository;

    public TradeProposalReadService(
            TradeProposalRepository proposalRepository,
            UserRepository userRepository
    ) {
        this.proposalRepository = proposalRepository;
        this.userRepository = userRepository;
    }

    public Page<TradeProposalViewResponse> findOwnProposals(
            String userId, String directionValue, TradeProposalStatus status,
            int page, int size
    ) {
        requireUser(userId);
        TradeProposalDirection direction = TradeProposalDirection.fromQuery(directionValue);
        if (page < 0) {
            throw new IllegalArgumentException("A página não pode ser negativa.");
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException("O tamanho da página deve estar entre 1 e 20.");
        }

        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
        Page<TradeProposal> proposals = switch (direction) {
            case SENT -> status == null
                    ? proposalRepository.findByProposerId(userId, pageable)
                    : proposalRepository.findByProposerIdAndStatus(userId, status, pageable);
            case RECEIVED -> status == null
                    ? proposalRepository.findByRecipientId(userId, pageable)
                    : proposalRepository.findByRecipientIdAndStatus(userId, status, pageable);
        };

        if (proposals.isEmpty()) return proposals.map(p -> toResponse(p, direction, Map.of()));

        // Uma unica consulta para os dados publicos de ambos os participantes.
        Set<String> ids = proposals.stream()
                .flatMap(p -> List.of(p.getProposerId(), p.getRecipientId()).stream())
                .collect(Collectors.toSet());
        Map<String, User> users = userRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return proposals.map(p -> toResponse(p, direction, users));
    }

    public TradeProposalViewResponse findOwnProposal(String userId, String id) {
        requireUser(userId);
        if (id == null || id.isBlank()) throw new TradeProposalNotFoundException();

        // Nao revelar ao usuario se uma proposta de terceiros existe.
        TradeProposal proposal = proposalRepository.findById(id)
                .filter(p -> userId.equals(p.getProposerId())
                        || userId.equals(p.getRecipientId()))
                .orElseThrow(TradeProposalNotFoundException::new);

        TradeProposalDirection direction = userId.equals(proposal.getProposerId())
                ? TradeProposalDirection.SENT : TradeProposalDirection.RECEIVED;
        Map<String, User> users = new HashMap<>();
        userRepository.findAllById(
                List.of(proposal.getProposerId(), proposal.getRecipientId()))
                .forEach(u -> users.put(u.getId(), u));
        return toResponse(proposal, direction, users);
    }

    private static TradeProposalViewResponse toResponse(
            TradeProposal proposal,
            TradeProposalDirection direction,
            Map<String, User> users
    ) {
        return new TradeProposalViewResponse(
                proposal.getId(),
                proposal.getAdId(),
                direction,
                proposal.getStatus(),
                proposal.getCreatedAt(),
                proposal.getUpdatedAt(),
                proposal.getAcceptedAt(),
                proposal.getRejectedAt(),
                proposal.getCancelledAt(),
                proposal.getCompletedAt(),
                toParticipant(proposal.getProposerId(), users.get(proposal.getProposerId())),
                toParticipant(proposal.getRecipientId(), users.get(proposal.getRecipientId())),
                proposal.getOfferedItems().stream().map(TradeProposalReadService::toItem).toList(),
                proposal.getRequestedItems().stream().map(TradeProposalReadService::toItem).toList(),
                toFinancialAdjustment(proposal),
                proposal.getEvents().stream().map(e -> toEvent(e, proposal)).toList());
    }

    private static TradeProposalViewResponse.Participant toParticipant(String id, User user) {
        // Nunca serializar User: email, passwordHash, role, cidade, links etc.
        return user == null
                ? new TradeProposalViewResponse.Participant(id, null, null)
                : new TradeProposalViewResponse.Participant(id, user.getUsername(), user.getName());
    }

    private static TradeProposalViewResponse.Item toItem(TradeProposalItem item) {
        CardSnapshot card = item.getCard();
        return new TradeProposalViewResponse.Item(
                card.getCardId(), card.getName(), card.getGame(), card.getEdition(),
                card.getCardNumber(), card.getImageUrl(), card.getCondition(),
                card.getLanguage(), item.getQuantity());
    }

    private static TradeProposalViewResponse.FinancialAdjustmentView toFinancialAdjustment(
            TradeProposal proposal
    ) {
        FinancialAdjustment adjustment = proposal.getFinancialAdjustment();
        if (adjustment == null) return null;
        TradeFinancialAdjustmentPayer payer = roleOf(adjustment.getPayerId(), proposal);
        return new TradeProposalViewResponse.FinancialAdjustmentView(
                adjustment.getAmount(), adjustment.getCurrency(), payer);
    }

    private static TradeProposalViewResponse.Event toEvent(
            TradeProposalEvent event, TradeProposal proposal
    ) {
        return new TradeProposalViewResponse.Event(
                event.getEventType(), event.getFromStatus(), event.getToStatus(),
                roleOf(event.getActorId(), proposal), event.getOccurredAt());
    }

    private static TradeFinancialAdjustmentPayer roleOf(String id, TradeProposal proposal) {
        if (proposal.getProposerId().equals(id)) return TradeFinancialAdjustmentPayer.PROPOSER;
        if (proposal.getRecipientId().equals(id)) return TradeFinancialAdjustmentPayer.RECIPIENT;
        return null; // Evento de sistema ou registro historico sem autor participante.
    }

    private static void requireUser(String userId) {
        if (userId == null || userId.isBlank()) throw new InvalidAuthenticationException();
    }
}
