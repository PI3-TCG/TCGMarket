package com.pitcc.service;

import com.pitcc.integration.catalog.mtg.MtgClient;
import com.pitcc.integration.catalog.mtg.dto.MtgLocalizedCardDto;
import com.pitcc.integration.catalog.tcgdex.TcgdexClient;
import com.pitcc.integration.catalog.yugioh.YugiohClient;
import com.pitcc.integration.catalog.yugioh.dto.YugiohCardDto;
import com.pitcc.model.CardGame;
import com.pitcc.model.CardLocalization;
import com.pitcc.model.CardSource;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.BulkOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

/**
 * Preenche {@code localizations} nas cartas que já estão no catálogo. Não cria cartas:
 * tradução sem carta correspondente só entra na contagem de {@code unmatched}.
 */
@Service
public class CatalogLocalizationService {

  private static final Logger log = LoggerFactory.getLogger(CatalogLocalizationService.class);
  static final String PT = "pt";
  private static final String COLLECTION = "cards";

  private final MongoTemplate mongoTemplate;
  private final TcgdexClient tcgdex;
  private final YugiohClient yugioh;
  private final MtgClient mtg;

  public CatalogLocalizationService(
          MongoTemplate mongoTemplate, TcgdexClient tcgdex, YugiohClient yugioh, MtgClient mtg) {
    this.mongoTemplate = mongoTemplate;
    this.tcgdex = tcgdex;
    this.yugioh = yugioh;
    this.mtg = mtg;
  }

  public CatalogLocalizationReport localize(String game) {
    CardGame selected = CatalogGameResolver.parse(game);
    return switch (selected) {
      case POKEMON -> localizePokemon();
      case YUGIOH -> localizeYugioh();
      case MAGIC_THE_GATHERING -> localizeMagic();
    };
  }

  private CatalogLocalizationReport localizePokemon() {
    CardSource source = CardSource.POKEMON_TCG_API;
    List<TcgdexClient.CardBrief> translated = tcgdex.cards(PT);
    Map<String, String> setNames = new HashMap<>();
    tcgdex.sets("en").forEach(set -> setNames.putIfAbsent(set.id(), set.name()));
    log.info("LOCALIZE_START source={} language={} fetched={}", source, PT, translated.size());

    Map<String, CardLocalization> matches =
            matchPokemon(translated, setNames, catalogPrintings(source));
    int modified = apply(source, CardGame.POKEMON, "externalId", matches);
    return new CatalogLocalizationReport(source, PT, translated.size(), matches.size(),
            modified, translated.size() - matches.size());
  }

  /** A YGOPRODeck traduz só o nome, por carta (passcode); vale para todas as impressões. */
  private CatalogLocalizationReport localizeYugioh() {
    CardSource source = CardSource.YGOPRODECK;
    List<YugiohCardDto> translated = yugioh.fetchAll(PT);
    log.info("LOCALIZE_START source={} language={} fetched={}", source, PT, translated.size());

    Set<String> conceptualIds = new HashSet<>(mongoTemplate.findDistinct(
            Query.query(Criteria.where("game").is(CardGame.YUGIOH).and("source").is(source)),
            "conceptualId", COLLECTION, String.class));
    Map<String, CardLocalization> matches = matchYugioh(translated, conceptualIds);
    int modified = apply(source, CardGame.YUGIOH, "conceptualId", matches);
    return new CatalogLocalizationReport(source, PT, translated.size(), matches.size(),
            modified, translated.size() - matches.size());
  }

  /**
   * Na Scryfall a impressão em PT tem a mesma coleção e número da inglesa: essas recebem
   * nome e imagem. As impressões que não saíram em PT recebem só o nome, pelo oracle_id.
   */
  private CatalogLocalizationReport localizeMagic() {
    CardSource source = CardSource.SCRYFALL;
    CardGame game = CardGame.MAGIC_THE_GATHERING;
    List<MtgLocalizedCardDto> translated = mtg.fetchAllPrintsInLanguage(PT);
    log.info("LOCALIZE_START source={} language={} fetched={}", source, PT, translated.size());

    Query query = Query.query(Criteria.where("game").is(game).and("source").is(source));
    query.fields().include("externalId", "codeCollection", "cardNumber");
    MagicMatches matches = matchMagic(translated, mongoTemplate.find(query, Document.class, COLLECTION));

    int modified = apply(source, game, "externalId", matches.byPrinting());
    int namesOnly = applyNameOnly(source, game, matches.namesByOracleId());
    log.info("LOCALIZE_NAME_ONLY source={} language={} oracleIds={} modified={}",
            source, PT, matches.namesByOracleId().size(), namesOnly);
    return new CatalogLocalizationReport(source, PT, translated.size(),
            matches.byPrinting().size(), modified + namesOnly,
            translated.size() - matches.byPrinting().size());
  }

  record MagicMatches(
          Map<String, CardLocalization> byPrinting,
          Map<String, String> namesByOracleId) {}

  static MagicMatches matchMagic(List<MtgLocalizedCardDto> translated, List<Document> catalog) {
    Map<String, String> externalIdByPrinting = new HashMap<>();
    for (Document card : catalog) {
      externalIdByPrinting.putIfAbsent(
              printingKey(card.getString("codeCollection"), card.getString("cardNumber")),
              card.getString("externalId"));
    }

    Map<String, CardLocalization> byPrinting = new LinkedHashMap<>();
    Map<String, String> namesByOracleId = new LinkedHashMap<>();
    for (MtgLocalizedCardDto card : translated) {
      String name = magicName(card);
      if (card == null || name == null) {
        continue;
      }
      if (card.oracleId() != null) {
        namesByOracleId.putIfAbsent(card.oracleId(), name);
      }
      String externalId = externalIdByPrinting.get(printingKey(card.setCode(), card.cardNumber()));
      if (externalId != null) {
        byPrinting.put(externalId, new CardLocalization(name, magicImage(card)));
      }
    }
    return new MagicMatches(byPrinting, namesByOracleId);
  }

  private static String magicName(MtgLocalizedCardDto card) {
    if (card == null) {
      return null;
    }
    if (card.printedName() != null && !card.printedName().isBlank()) {
      return card.printedName().strip();
    }
    if (card.cardFaces() == null || card.cardFaces().isEmpty()) {
      return null;
    }
    List<String> faces = card.cardFaces().stream()
            .map(MtgLocalizedCardDto.Face::printedName)
            .filter(face -> face != null && !face.isBlank())
            .map(String::strip)
            .toList();
    return faces.size() == card.cardFaces().size() ? String.join(" // ", faces) : null;
  }

  private static String magicImage(MtgLocalizedCardDto card) {
    if (!"highres_scan".equals(card.imageStatus()) && !"lowres".equals(card.imageStatus())) {
      return null;
    }
    if (card.imageUris() != null) {
      return card.imageUris().normal();
    }
    if (card.cardFaces() != null && !card.cardFaces().isEmpty()
            && card.cardFaces().getFirst().imageUris() != null) {
      return card.cardFaces().getFirst().imageUris().normal();
    }
    return null;
  }

  /** Só preenche quem ainda não tem tradução, para não sobrescrever a da impressão exata. */
  private int applyNameOnly(CardSource source, CardGame game, Map<String, String> namesByOracleId) {
    if (namesByOracleId.isEmpty()) {
      return 0;
    }
    BulkOperations bulk = mongoTemplate.bulkOps(BulkOperations.BulkMode.UNORDERED, COLLECTION);
    namesByOracleId.forEach((oracleId, name) -> bulk.updateMulti(
            Query.query(Criteria.where("source").is(source).and("game").is(game)
                    .and("conceptualId").is(oracleId).and("localizations." + PT).exists(false)),
            new Update().set("localizations." + PT, new Document("name", name).append("imageUrl", null))));
    return bulk.execute().getModifiedCount();
  }

  static Map<String, CardLocalization> matchYugioh(
          List<YugiohCardDto> translated, Set<String> catalogConceptualIds) {
    Map<String, CardLocalization> matches = new LinkedHashMap<>();
    for (YugiohCardDto card : translated) {
      if (card == null || card.id() == null || card.name() == null || card.name().isBlank()) {
        continue;
      }
      String conceptualId = card.id().toString();
      if (catalogConceptualIds.contains(conceptualId)) {
        matches.put(conceptualId, new CardLocalization(card.name().strip(), null));
      }
    }
    return matches;
  }

  /**
   * A TCGdex usa os mesmos ids da Pokémon TCG API nas coleções antigas; nas novas o
   * formato difere (sv03.5-001 x sv3pt5-1), então o reserva é nome da coleção + número.
   */
  static Map<String, CardLocalization> matchPokemon(
          List<TcgdexClient.CardBrief> translated,
          Map<String, String> setNames,
          List<Document> catalog) {

    Set<String> externalIds = new HashSet<>();
    Map<String, String> byPrinting = new HashMap<>();
    for (Document card : catalog) {
      String externalId = card.getString("externalId");
      externalIds.add(externalId);
      byPrinting.putIfAbsent(
              printingKey(card.getString("edition"), card.getString("cardNumber")), externalId);
    }

    Map<String, CardLocalization> matches = new LinkedHashMap<>();
    for (TcgdexClient.CardBrief card : translated) {
      if (card == null || card.id() == null || card.name() == null || card.name().isBlank()) {
        continue;
      }
      String externalId = externalIds.contains(card.id())
              ? card.id()
              : byPrinting.get(printingKey(setNames.get(setId(card.id())), card.localId()));
      if (externalId != null) {
        String image = card.image() == null ? null : card.image() + "/high.png";
        matches.put(externalId, new CardLocalization(card.name().strip(), image));
      }
    }
    return matches;
  }

  private List<Document> catalogPrintings(CardSource source) {
    Query query = Query.query(Criteria.where("source").is(source));
    query.fields().include("externalId", "edition", "cardNumber");
    return mongoTemplate.find(query, Document.class, COLLECTION);
  }

  /**
   * {@code field} é a chave de {@code matches}; um conceptualId atualiza todas as impressões.
   * O filtro inclui game para usar os índices (source, externalId) e (game, conceptualId).
   */
  private int apply(CardSource source, CardGame game, String field,
                    Map<String, CardLocalization> matches) {
    if (matches.isEmpty()) {
      return 0;
    }
    BulkOperations bulk = mongoTemplate.bulkOps(BulkOperations.BulkMode.UNORDERED, COLLECTION);
    matches.forEach((key, localization) -> bulk.updateMulti(
            Query.query(Criteria.where("source").is(source).and("game").is(game).and(field).is(key)),
            new Update().set("localizations." + PT, new Document("name", localization.name())
                    .append("imageUrl", localization.imageUrl()))));
    return bulk.execute().getModifiedCount();
  }

  private static String setId(String cardId) {
    int separator = cardId.lastIndexOf('-');
    return separator < 0 ? cardId : cardId.substring(0, separator);
  }

  private static String printingKey(String edition, String number) {
    String normalizedNumber = number == null ? "" : number.strip().replaceFirst("^0+(?=.)", "");
    String normalizedEdition = edition == null ? "" : edition.strip();
    return (normalizedEdition + "|" + normalizedNumber).toLowerCase(Locale.ROOT);
  }
}
