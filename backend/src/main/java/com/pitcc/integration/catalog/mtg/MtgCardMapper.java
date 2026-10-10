package com.pitcc.integration.catalog.mtg;

import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.mtg.dto.MtgCardDto;
import com.pitcc.integration.catalog.mtg.dto.MtgCardFaceDto;
import com.pitcc.integration.catalog.mtg.dto.MtgImageUris;
import com.pitcc.model.CardGame;
import com.pitcc.model.MagicCard;
import com.pitcc.model.MagicCardType;
import com.pitcc.model.MagicColor;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

final class MtgCardMapper {
  private MtgCardMapper() {}

  static Optional<ExternalCard> toExternalCard(MtgCardDto dto) {
    if (dto == null || isBlank(dto.id()) || isBlank(dto.name())) return Optional.empty();
    return Optional.of(new ExternalCard(dto.id(), dto.oracleId(), dto.name(),
            CardGame.MAGIC_THE_GATHERING, dto.setName(), dto.setCode(),
            dto.cardNumber(), dto.rarity(), imageUrl(dto)));
  }

  static Optional<MagicCard> toMagicCard(MtgCardDto dto) {
    if (dto == null || isBlank(dto.id()) || isBlank(dto.name())) return Optional.empty();
    MtgCardFaceDto face = firstFace(dto);
    String typeLine = firstText(dto.typeLine(), face == null ? null : face.typeLine());
    List<MagicCardType> types = parseCardTypes(typeLine);
    if (types.isEmpty()) {
      throw new IllegalArgumentException("Tipo Magic ausente ou não reconhecido: " + typeLine);
    }
    List<MagicColor> colors = parseColors(dto.colors() != null ? dto.colors()
            : face == null ? null : face.colors());
    String manaCost = firstText(dto.manaCost(), face == null ? null : face.manaCost());
    String power = firstText(dto.power(), face == null ? null : face.power());
    String toughness = firstText(dto.toughness(), face == null ? null : face.toughness());
    String rules = firstText(dto.oracleText(), face == null ? null : face.oracleText());
    String[] parts = typeLine.split("\\s+[—–]\\s+", 2);
    List<String> superTypes = new ArrayList<>();
    for (String word : parts[0].trim().split("\\s+")) {
      if (word.equalsIgnoreCase("Basic") || word.equalsIgnoreCase("Legendary")
              || word.equalsIgnoreCase("Snow") || word.equalsIgnoreCase("World")
              || word.equalsIgnoreCase("Ongoing")) superTypes.add(word);
    }
    List<String> subTypes = parts.length < 2 ? List.of() : List.of(parts[1].trim().split("\\s+"));
    MagicCard card = new MagicCard(dto.name(), dto.setName(), dto.setCode(),
            dto.cardNumber(), dto.rarity(), imageUrl(dto), dto.id(), manaCost, dto.cmc(),
            colors, types, power, toughness, superTypes, subTypes, rules);
    card.setConceptualId(dto.oracleId());
    return Optional.of(card);
  }

  private static List<MagicColor> parseColors(List<String> codes) {
    if (codes == null || codes.isEmpty()) return List.of(); // Scryfall representa incolor como []
    List<MagicColor> result = new ArrayList<>();
    for (String code : codes) {
      if (code == null) throw new IllegalArgumentException("Cor Magic nula");
      MagicColor color = switch (code.strip().toUpperCase(Locale.ROOT)) {
        case "W" -> MagicColor.WHITE;
        case "U" -> MagicColor.BLUE;
        case "B" -> MagicColor.BLACK;
        case "R" -> MagicColor.RED;
        case "G" -> MagicColor.GREEN;
        default -> throw new IllegalArgumentException("Cor Magic desconhecida: " + code);
      };
      result.add(color);
    }
    return List.copyOf(result);
  }

  private static List<MagicCardType> parseCardTypes(String typeLine) {
    if (isBlank(typeLine)) return List.of();
    String mainTypes = typeLine.split("[—–]", 2)[0];
    List<MagicCardType> result = new ArrayList<>();
    for (String word : mainTypes.trim().split("\\s+")) {
      try {
        MagicCardType type = MagicCardType.valueOf(word.toUpperCase(Locale.ROOT));
        if (!result.contains(type)) result.add(type);
      } catch (IllegalArgumentException ignored) {
        // Supertipos como Legendary não são MagicCardType.
      }
    }
    return List.copyOf(result);
  }

  private static MtgCardFaceDto firstFace(MtgCardDto dto) {
    if (dto.cardFaces() == null) return null;
    return dto.cardFaces().stream().filter(f -> f != null).findFirst().orElse(null);
  }

  private static String firstText(String primary, String fallback) {
    return !isBlank(primary) ? primary : !isBlank(fallback) ? fallback : null;
  }

  private static String imageUrl(MtgCardDto dto) {
    String direct = imageUrl(dto.imageUris());
    if (direct != null) return direct;
    if (dto.cardFaces() == null) return null;
    for (MtgCardFaceDto face : dto.cardFaces()) {
      if (face == null) continue;
      String image = imageUrl(face.imageUris());
      if (image != null) return image;
    }
    return null;
  }

  private static String imageUrl(MtgImageUris images) {
    if (images == null) return null;
    if (!isBlank(images.normal())) return images.normal();
    return isBlank(images.small()) ? null : images.small();
  }

  private static boolean isBlank(String value) {
    return value == null || value.isBlank();
  }
}
