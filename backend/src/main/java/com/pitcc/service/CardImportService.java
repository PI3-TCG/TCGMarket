
package com.pitcc.service;

import com.pitcc.model.Card;
import com.pitcc.repository.CardRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.Objects;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.FindAndReplaceOptions;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;

@Service
public class CardImportService {

    private final CardRepository cardRepository;

    private final MongoTemplate mongoTemplate;

    public CardImportService(CardRepository cardRepository, MongoTemplate mongoTemplate) {
        this.cardRepository = cardRepository;
        this.mongoTemplate = mongoTemplate;
    }

    /**
     * Snapshot completo da fonte. Substitui os campos do catálogo, incluindo nulos,
     * preservando o _id. Dados de posse/anúncio devem continuar em suas collections.
     * Em concorrência, vence a última substituição concluída pelo MongoDB.
     */
    public Card upsert(Card incoming) {
        Objects.requireNonNull(incoming, "A carta não pode ser nula.");
        if (incoming.getSource() == null || incoming.getExternalId() == null
                || incoming.getExternalId().isBlank()) {
            throw new IllegalArgumentException("Origem e identificador externo são obrigatórios.");
        }
        // findAndReplace exige substituição sem ID. Copiamos pelo converter para
        // aceitar tanto entidades novas quanto as já lidas, sem modificar o argumento.
        Document document = new Document();
        mongoTemplate.getConverter().write(incoming, document);
        document.remove("_id");
        Card replacement = mongoTemplate.getConverter().read(Card.class, document);
        Query query = Query.query(Criteria.where("source").is(incoming.getSource())
                .and("externalId").is(incoming.getExternalId()));
        try {
            return Objects.requireNonNull(mongoTemplate.findAndReplace(query, replacement,
                    FindAndReplaceOptions.options().upsert().returnNew(),
                    Card.class, "cards", Card.class), "MongoDB não retornou a carta persistida.");
        } catch (DuplicateKeyException concurrentInsert) {
            // Outra importação pode ter inserido a mesma identidade entre as operações.
            Card updated = mongoTemplate.findAndReplace(query, replacement,
                    FindAndReplaceOptions.options().returnNew(), Card.class, "cards", Card.class);
            if (updated == null) throw concurrentInsert;
            return updated;
        }
    }

    public Card saveIfAbsent(Card card) {
        Objects.requireNonNull(card, "A carta não pode ser nula.");

        return cardRepository.findBySourceAndExternalId(
                card.getSource(),
                card.getExternalId()
        ).orElseGet(() -> {
            try {
                return cardRepository.save(card);
            } catch (DuplicateKeyException exception) {
                return cardRepository.findBySourceAndExternalId(
                        card.getSource(),
                        card.getExternalId()
                ).orElseThrow(() -> exception);
            }
        });
    }
}
