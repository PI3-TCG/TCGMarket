package com.pitcc.repository;

import com.pitcc.model.TradeProposal;
import com.pitcc.model.TradeProposalStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TradeProposalRepository extends MongoRepository<TradeProposal, String> {

    // Mantido: idempotencia do envio (issue #83).
    Optional<TradeProposal> findByProposerIdAndRequestKey(String proposerId, String requestKey);

    // Issue #84: consultas sempre filtradas pelo participante autenticado.
    Page<TradeProposal> findByProposerId(String proposerId, Pageable pageable);
    Page<TradeProposal> findByRecipientId(String recipientId, Pageable pageable);
    Page<TradeProposal> findByProposerIdAndStatus(
            String proposerId, TradeProposalStatus status, Pageable pageable);
    Page<TradeProposal> findByRecipientIdAndStatus(
            String recipientId, TradeProposalStatus status, Pageable pageable);
}
