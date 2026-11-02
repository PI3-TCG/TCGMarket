package com.pitcc.repository;

import com.pitcc.model.CardCondition;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLanguage;
import com.pitcc.model.CardSnapshot;
import com.pitcc.model.TargetAdSnapshot;
import com.pitcc.model.TradeProposal;
import com.pitcc.model.TradeProposalItem;
import com.pitcc.model.TradeProposalStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/** Executar com o Mongo de testes (localhost:27018), nunca no banco de desenvolvimento. */
@SpringBootTest
@ActiveProfiles("test")
class TradeProposalReadRepositoryIntegrationTest {
    @Autowired TradeProposalRepository repository;

    private TradeProposal proposal(String proposer, String recipient) {
        var card = new CardSnapshot("card-1", "Carta teste", CardGame.POKEMON,
                "Edicao", "001", null, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE);
        return TradeProposal.create(proposer, recipient, "ad-1",
                new TargetAdSnapshot(recipient, "target-1", "card-1", true),
                List.of(new TradeProposalItem("offer-1", "card-1", null, 1, card)),
                List.of(new TradeProposalItem("target-1", "card-1", "ad-1", 1, card)),
                null, UUID.randomUUID().toString(), Instant.now());
    }

    @Test
    void filtersSentReceivedAndStatusWithoutMixingParticipants() {
        String prefix = "issue84-" + UUID.randomUUID() + "-";
        String alice = prefix + "alice";
        String bob = prefix + "bob";
        String charlie = prefix + "charlie";
        List<String> insertedIds = new ArrayList<>();

        try {
            for (TradeProposal proposal : List.of(
                    proposal(alice, bob), proposal(alice, charlie), proposal(charlie, bob))) {
                insertedIds.add(repository.insert(proposal).getId());
            }
            var pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
            assertEquals(2, repository.findByProposerId(alice, pageable).getTotalElements());
            assertEquals(2, repository.findByRecipientId(bob, pageable).getTotalElements());
            assertEquals(0, repository.findByRecipientId(alice, pageable).getTotalElements());
            assertEquals(2, repository.findByRecipientIdAndStatus(
                    bob, TradeProposalStatus.PENDING, pageable).getTotalElements());
            assertEquals(0, repository.findByProposerIdAndStatus(
                    alice, TradeProposalStatus.CANCELLED, pageable).getTotalElements());
        } finally {
            repository.deleteAllById(insertedIds);
        }
    }
}
