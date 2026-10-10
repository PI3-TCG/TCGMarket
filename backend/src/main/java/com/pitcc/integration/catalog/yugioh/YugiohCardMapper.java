package com.pitcc.integration.catalog.yugioh;

import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.yugioh.dto.YugiohCardDto;
import com.pitcc.integration.catalog.yugioh.dto.YugiohCardImageDto;
import com.pitcc.integration.catalog.yugioh.dto.YugiohCardSetDto;
import com.pitcc.model.CardGame;
import com.pitcc.model.YugiohCard;
import com.pitcc.model.YugiohCardType;
import com.pitcc.model.YugiohAttribute;
import com.pitcc.model.YugiohInvocation;
import java.util.ArrayList;
import java.util.Locale;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

final class YugiohCardMapper {

  private YugiohCardMapper() {}

  /**
   * Converte uma carta conceitual (passcode) em uma {@link ExternalCard} por impressão de
   * {@code card_sets}. Sem impressões utilizáveis, a carta não gera resultado: não existe
   * edição que possa entrar numa coleção ou num anúncio.
   */
  static List<ExternalCard> toExternalCards(YugiohCardDto dto) {
    if (dto == null || dto.id() == null || isBlank(dto.name()) || dto.cardSets() == null) {
      return List.of();
    }
    String conceptualId = Long.toString(dto.id());
    String imageUrl = imageUrl(dto.cardImages());
    Map<String, ExternalCard> printings = new LinkedHashMap<>();
    for (YugiohCardSetDto set : dto.cardSets()) {
      if (set == null || isBlank(set.setCode())) {
        continue;
      }
      String externalId = new YugiohPrintingId(dto.id(), set.setCode(), set.setRarity()).value();
      printings.putIfAbsent(externalId, new ExternalCard(
              externalId,
              conceptualId,
              dto.name(),
              CardGame.YUGIOH,
              set.setName(),
              set.setCode(),
              null,
              set.setRarity(),
              imageUrl));
    }
    return List.copyOf(printings.values());
  }

  /** Converte cada impressão da API em uma entidade de domínio distinta. */
  static List<YugiohCard> toYugiohCards(YugiohCardDto dto) {
    if (dto == null || dto.id() == null || isBlank(dto.name()) || dto.cardSets() == null) {
      return List.of();
    }

    YugiohCardType cardType = parseCardType(dto.type());
    boolean monster = cardType == YugiohCardType.MONSTER;
    List<YugiohInvocation> forms = monster ? parseInvocationForms(dto.type()) : List.of();
    boolean xyz = forms.contains(YugiohInvocation.XYZ);
    boolean link = forms.contains(YugiohInvocation.LINK);

    Integer level = monster && !xyz && !link ? dto.level() : null;
    Integer rank = xyz ? dto.level() : null;
    Integer linkRating = link ? dto.linkVal() : null;
    YugiohAttribute attribute = monster ? parseAttribute(dto.attribute()) : null;
    String monsterType = monster ? dto.race() : null;
    String image = imageUrl(dto.cardImages());

    Map<String, YugiohCard> cards = new LinkedHashMap<>();
    for (YugiohCardSetDto set : dto.cardSets()) {
      if (set == null || isBlank(set.setCode()) || isBlank(set.setName())) {
        throw new IllegalArgumentException("Impressão Yu-Gi-Oh! sem código ou nome de set; DTO rejeitado integralmente.");
      }
      String externalId = new YugiohPrintingId(dto.id(), set.setCode(), set.setRarity()).value();
      YugiohCard card = new YugiohCard(
              dto.name(), set.setName(), set.setCode(), null, set.setRarity(), image,
              externalId, monster ? dto.atk() : null, monster && !link ? dto.def() : null,
              level, rank, linkRating, attribute, monsterType, cardType, forms);
      card.setConceptualId(dto.id().toString());
      cards.putIfAbsent(externalId, card);
    }
    return List.copyOf(cards.values());
  }

  private static YugiohCardType parseCardType(String type) {
    if (isBlank(type)) throw new IllegalArgumentException("Tipo Yu-Gi-Oh! ausente");
    String normalized = type.toLowerCase(Locale.ROOT);
    if (normalized.contains("spell card")) return YugiohCardType.SPELL;
    if (normalized.contains("trap card")) return YugiohCardType.TRAP;
    if (normalized.contains("monster") || normalized.contains("token")) return YugiohCardType.MONSTER;
    throw new IllegalArgumentException("Tipo Yu-Gi-Oh! desconhecido: " + type);
  }

  private static YugiohAttribute parseAttribute(String attribute) {
    if (isBlank(attribute)) throw new IllegalArgumentException("Atributo do monstro ausente");
    try {
      return YugiohAttribute.valueOf(attribute.strip().toUpperCase(Locale.ROOT));
    } catch (IllegalArgumentException ex) {
      throw new IllegalArgumentException("Atributo Yu-Gi-Oh! desconhecido: " + attribute, ex);
    }
  }

  private static List<YugiohInvocation> parseInvocationForms(String type) {
    if (isBlank(type)) {
      return List.of();
    }

    String normalized = type.strip().toLowerCase(Locale.ROOT);
    List<YugiohInvocation> forms = new ArrayList<>();

    if (normalized.contains("normal monster")) forms.add(YugiohInvocation.NORMAL);
    if (normalized.contains("fusion")) forms.add(YugiohInvocation.FUSION);
    if (normalized.contains("synchro")) forms.add(YugiohInvocation.SYNCHRO);
    if (normalized.contains("xyz")) forms.add(YugiohInvocation.XYZ);
    if (normalized.contains("link")) forms.add(YugiohInvocation.LINK);
    if (normalized.contains("ritual")) forms.add(YugiohInvocation.RITUAL);
    if (normalized.contains("pendulum")) forms.add(YugiohInvocation.PENDULUM);

    return List.copyOf(forms);
  }

  // card_images lista artes da carta, não impressões; a primeira é a arte principal.
  private static String imageUrl(List<YugiohCardImageDto> images) {
    if (images == null) {
      return null;
    }
    YugiohCardImageDto image = images.stream().filter(Objects::nonNull).findFirst().orElse(null);
    if (image == null) {
      return null;
    }
    if (!isBlank(image.imageUrl())) {
      return image.imageUrl();
    }
    return image.imageUrlSmall();
  }

  private static boolean isBlank(String value) {
    return value == null || value.isBlank();
  }
}
