package com.pitcc.integration.catalog.yugioh;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class YugiohPrintingIdTest {

  @Test
  void shouldComposePasscodeSetCodeAndRarity() {
    assertEquals("89631139:LOB-EN001:Ultra Rare",
        new YugiohPrintingId(89631139L, " LOB-EN001 ", " Ultra Rare ").value());
    assertEquals("89631139:LOB-EN001", new YugiohPrintingId(89631139L, "LOB-EN001", " ").value());
  }

  @Test
  void shouldRoundTripValue() {
    YugiohPrintingId id = YugiohPrintingId.parse("14558127:RA01-EN008:Collector's Rare").orElseThrow();

    assertEquals(14558127L, id.passcode());
    assertEquals("RA01-EN008", id.setCode());
    assertEquals("Collector's Rare", id.rarity());
    assertEquals("14558127:RA01-EN008:Collector's Rare", id.value());

    YugiohPrintingId withoutRarity = YugiohPrintingId.parse("89631139:LOB-EN001").orElseThrow();
    assertNull(withoutRarity.rarity());
  }

  @Test
  void shouldRejectMalformedIds() {
    assertTrue(YugiohPrintingId.parse(null).isEmpty());
    assertTrue(YugiohPrintingId.parse("89631139").isEmpty());
    assertTrue(YugiohPrintingId.parse("abc:LOB-EN001").isEmpty());
    assertTrue(YugiohPrintingId.parse("89631139: ").isEmpty());
    assertTrue(YugiohPrintingId.parse("89631139:LOB-EN001: ").isEmpty());
    assertTrue(YugiohPrintingId.parse("99999999999999999999:LOB-EN001").isEmpty());
  }
}
