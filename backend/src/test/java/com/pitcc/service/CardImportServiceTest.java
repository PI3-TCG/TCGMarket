
package com.pitcc.service;

import com.pitcc.model.Card;
import com.pitcc.model.PokemonCard;
import com.pitcc.model.PokemonCardType;
import com.pitcc.model.PokemonEnergyType;
import com.pitcc.repository.CardRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class CardImportServiceTest {

    @Autowired
    private CardImportService cardImportService;

    @Autowired
    private CardRepository cardRepository;

    @Test
    void shouldNotDuplicateImportedCard() {

        String externalId = "test-" + UUID.randomUUID();

        PokemonCard pokemon = new PokemonCard(
                "Pikachu",
                "Base Set",
                "base1",
                "25",
                "Common",
                null,
                externalId,
                60,
                PokemonCardType.POKEMON,
                List.of(PokemonEnergyType.LIGHTNING),
                null,
                1,
                List.of()
        );

        try {
            Card first = cardImportService.saveIfAbsent(pokemon);
            Card second = cardImportService.saveIfAbsent(pokemon);

            assertNotNull(first.getId());
            assertEquals(first.getId(), second.getId());

            assertTrue(
                    cardRepository.existsBySourceAndExternalId(
                            pokemon.getSource(),
                            externalId
                    )
            );

        } finally {
            cardRepository.findBySourceAndExternalId(
                    pokemon.getSource(),
                    externalId
            ).ifPresent(cardRepository::delete);
        }
    }
}
