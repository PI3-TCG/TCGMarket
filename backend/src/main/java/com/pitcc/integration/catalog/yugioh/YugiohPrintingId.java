package com.pitcc.integration.catalog.yugioh;

import java.util.Optional;

/**
 * Id de uma impressão Yu-Gi-Oh!: {@code passcode:set_code[:set_rarity]}.
 *
 * <p>O mesmo {@code set_code} aparece com raridades diferentes para um passcode (ex.:
 * RA01-EN008 em sete raridades), então a raridade faz parte da identidade da impressão.
 * Ela só fica de fora quando a API não informa raridade.
 */
record YugiohPrintingId(long passcode, String setCode, String rarity) {

  private static final String SEPARATOR = ":";

  YugiohPrintingId {
    if (setCode == null || setCode.isBlank()) {
      throw new IllegalArgumentException("setCode must not be blank");
    }
    setCode = setCode.trim();
    rarity = rarity == null || rarity.isBlank() ? null : rarity.trim();
  }

  String value() {
    String id = passcode + SEPARATOR + setCode;
    return rarity == null ? id : id + SEPARATOR + rarity;
  }

  static Optional<YugiohPrintingId> parse(String externalId) {
    if (externalId == null) {
      return Optional.empty();
    }
    String[] parts = externalId.trim().split(SEPARATOR, 3);
    if (parts.length < 2 || !parts[0].matches("\\d+") || parts[1].isBlank()) {
      return Optional.empty();
    }
    if (parts.length == 3 && parts[2].isBlank()) {
      return Optional.empty();
    }
    long passcode;
    try {
      passcode = Long.parseLong(parts[0]);
    } catch (NumberFormatException exception) {
      return Optional.empty();
    }
    return Optional.of(new YugiohPrintingId(passcode, parts[1], parts.length == 3 ? parts[2] : null));
  }
}
