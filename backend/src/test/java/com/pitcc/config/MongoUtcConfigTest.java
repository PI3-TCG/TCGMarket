package com.pitcc.config;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;
import org.junit.jupiter.api.Test;

class MongoUtcConfigTest {

  @Test
  void shouldStoreLocalDateTimeAsUtcInstant() {
    LocalDateTime utc = LocalDateTime.parse("2026-10-02T19:01:42");

    Date stored = new MongoUtcConfig.LocalDateTimeWriteConverter().convert(utc);
    LocalDateTime read = new MongoUtcConfig.LocalDateTimeReadConverter().convert(stored);

    assertEquals(utc.toInstant(ZoneOffset.UTC), stored.toInstant());
    assertEquals(utc, read);
  }
}
