package com.pitcc.repository;

import com.pitcc.model.TradeProposal;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

/** A consulta por chave serve somente a reenvios do POST; listagens ficam para outra issue. */
public interface TradeProposalRepository extends MongoRepository<TradeProposal, String> {
    Optional<TradeProposal> findByProposerIdAndRequestKey(String proposerId, String requestKey);
}
