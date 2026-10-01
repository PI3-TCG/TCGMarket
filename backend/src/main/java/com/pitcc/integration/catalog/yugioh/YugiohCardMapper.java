package com.pitcc.integration.catalog.yugioh;

import com.pitcc.integration.catalog.CardGame;
import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.yugioh.dto.YugiohCardDto;
import com.pitcc.integration.catalog.yugioh.dto.YugiohCardImageDto;
import com.pitcc.integration.catalog.yugioh.dto.YugiohCardSetDto;
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
