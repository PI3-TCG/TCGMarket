package com.pitcc.integration.catalog.mtg;

import com.pitcc.integration.catalog.CardGame;
import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.mtg.dto.MtgCardDto;
import com.pitcc.integration.catalog.mtg.dto.MtgCardFaceDto;
import com.pitcc.integration.catalog.mtg.dto.MtgImageUris;
import java.util.Optional;

final class MtgCardMapper {

  private MtgCardMapper() {}

  static Optional<ExternalCard> toExternalCard(MtgCardDto dto) {
    if (dto == null || isBlank(dto.id()) || isBlank(dto.name())) {
      return Optional.empty();
    }
    return Optional.of(new ExternalCard(
        dto.id(),
        dto.oracleId(),
        dto.name(),
        CardGame.MAGIC_THE_GATHERING,
        dto.setName(),
        dto.setCode(),
        dto.cardNumber(),
        dto.rarity(),
        imageUrl(dto)));
  }

  private static String imageUrl(MtgCardDto dto) {
    String direct = imageUrl(dto.imageUris());
    if (direct != null) {
      return direct;
    }
    if (dto.cardFaces() == null) {
      return null;
    }
    for (MtgCardFaceDto face : dto.cardFaces()) {
      if (face == null) {
        continue;
      }
      String faceImage = imageUrl(face.imageUris());
      if (faceImage != null) {
        return faceImage;
      }
    }
    return null;
  }

  private static String imageUrl(MtgImageUris images) {
    if (images == null) {
      return null;
    }
    if (!isBlank(images.normal())) {
      return images.normal();
    }
    return isBlank(images.small()) ? null : images.small();
  }

  private static boolean isBlank(String value) {
    return value == null || value.isBlank();
  }
}
