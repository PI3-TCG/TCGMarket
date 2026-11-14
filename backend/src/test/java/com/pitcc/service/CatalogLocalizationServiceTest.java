package com.pitcc.service;

import static org.junit.jupiter.api.Assertions.*;

import com.pitcc.integration.catalog.mtg.dto.MtgImageUris;
import com.pitcc.integration.catalog.mtg.dto.MtgLocalizedCardDto;
import com.pitcc.integration.catalog.tcgdex.TcgdexClient.CardBrief;
import com.pitcc.integration.catalog.yugioh.dto.YugiohCardDto;
import com.pitcc.model.CardLocalization;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.bson.Document;
import org.junit.jupiter.api.Test;

class CatalogLocalizationServiceTest {

  private static Document card(String externalId, String edition, String number) {
    return new Document("externalId", externalId).append("edition", edition).append("cardNumber", number);
  }

  @Test void shouldMatchPokemonByIdAndFallBackToSetNameAndNumber() {
    List<Document> catalog = List.of(
        card("bw1-1", "Black & White", "1"),
        card("sv3pt5-25", "151", "25"),
        card("base1-4", "Base Set", "4"));
    List<CardBrief> translated = List.of(
        new CardBrief("bw1-1", "1", " Snivy ", "https://assets.tcgdex.net/pt/bw/bw1/1"),
        new CardBrief("sv03.5-025", "025", "Pikachu", null),
        new CardBrief("unknown-1", "1", "Sem carta", null),
        new CardBrief("base1-5", "5", "", null));

    Map<String, CardLocalization> matches = CatalogLocalizationService.matchPokemon(
        translated, Map.of("sv03.5", "151", "bw1", "Black & White"), catalog);

    assertEquals(2, matches.size());
    assertEquals(new CardLocalization("Snivy", "https://assets.tcgdex.net/pt/bw/bw1/1/high.png"),
        matches.get("bw1-1"));
    assertEquals(new CardLocalization("Pikachu", null), matches.get("sv3pt5-25"),
        "nas coleções novas o id difere; casa pelo nome da coleção e número sem zeros à esquerda");
  }

  @Test void shouldMatchMagicByPrintingAndKeepOnlyRealScans() {
    List<Document> catalog = List.of(
        new Document("externalId", "en-bolt").append("codeCollection", "m10").append("cardNumber", "146"),
        new Document("externalId", "en-delver").append("codeCollection", "isd").append("cardNumber", "51"));
    MtgImageUris boltImage = new MtgImageUris("small", "https://img.example/raio-pt.jpg");
    List<MtgLocalizedCardDto> translated = List.of(
        new MtgLocalizedCardDto("oracle-bolt", "m10", "146", "Raio", "highres_scan", boltImage, null),
        new MtgLocalizedCardDto("oracle-delver", "isd", "51", null, "placeholder", null, List.of(
            new MtgLocalizedCardDto.Face("Perscrutador de Segredos", null),
            new MtgLocalizedCardDto.Face("Aberração Insetoide", null))),
        new MtgLocalizedCardDto("oracle-other", "xyz", "1", "Sem impressão no catálogo", "lowres", null, null));

    var matches = CatalogLocalizationService.matchMagic(translated, catalog);

    assertEquals(new CardLocalization("Raio", "https://img.example/raio-pt.jpg"),
        matches.byPrinting().get("en-bolt"));
    assertEquals(new CardLocalization("Perscrutador de Segredos // Aberração Insetoide", null),
        matches.byPrinting().get("en-delver"), "imagem provisória da Scryfall não é scan em PT");
    assertEquals(2, matches.byPrinting().size());
    assertEquals("Sem impressão no catálogo", matches.namesByOracleId().get("oracle-other"),
        "sem impressão correspondente, o nome ainda vale para a carta pelo oracle_id");
  }

  @Test void shouldMatchYugiohByPasscodeOnlyForCardsInTheCatalog() {
    List<YugiohCardDto> translated = List.of(
        new YugiohCardDto(46986414L, " Mago Negro ", List.of(), List.of()),
        new YugiohCardDto(89631139L, "Dragão Branco de Olhos Azuis", List.of(), List.of()),
        new YugiohCardDto(null, "Sem passcode", List.of(), List.of()));

    Map<String, CardLocalization> matches =
        CatalogLocalizationService.matchYugioh(translated, Set.of("46986414"));

    assertEquals(Map.of("46986414", new CardLocalization("Mago Negro", null)), matches);
  }
}
