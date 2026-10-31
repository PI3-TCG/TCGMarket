package com.pitcc.dto;

import com.pitcc.model.CardGame;
import com.pitcc.model.CardCondition;
import com.pitcc.model.CardLanguage;
import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MarketplaceFilters(

        @Size(
                max = 100,
                message = "A pesquisa deve ter no máximo 100 caracteres."
        )
        String search,

        CardGame game,

        @Pattern(
                regexp = "SALE|TRADE|BOTH",
                message = "Selecione uma modalidade válida."
        )
        String modality,
        @Size(max = 200) String edition,
        @Size(max = 100) String rarity,
        CardCondition condition,
        CardLanguage language,
        @DecimalMin("0.00") @DecimalMax(value = "999999.99", message = "Informe um preço válido.") @Digits(integer = 6, fraction = 2) BigDecimal minPrice,
        @DecimalMin("0.00") @DecimalMax(value = "999999.99", message = "Informe um preço válido.") @Digits(integer = 6, fraction = 2) BigDecimal maxPrice

) {

    public MarketplaceFilters {
        search = normalize(search);
        modality = normalize(modality);
        edition = normalize(edition);
        rarity = normalize(rarity);
    }

    public MarketplaceFilters(String search, CardGame game, String modality) {
        this(search, game, modality, null, null, null, null, null, null);
    }

    @AssertTrue(message = "O preço mínimo não pode ser maior que o máximo.")
    public boolean isPriceRangeValid() {
        return minPrice == null || maxPrice == null || minPrice.compareTo(maxPrice) <= 0;
    }

    private static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.strip();
    }
}