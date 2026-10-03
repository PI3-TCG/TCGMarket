package com.pitcc.config;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

@Configuration
public class MongoUtcConfig {

  @Bean
  MongoCustomConversions mongoCustomConversions() {
    return MongoCustomConversions.create(
        adapter ->
            adapter.registerConverters(
                List.of(new LocalDateTimeWriteConverter(), new LocalDateTimeReadConverter())));
  }

  static final class LocalDateTimeWriteConverter implements Converter<LocalDateTime, Date> {

    @Override
    public Date convert(LocalDateTime source) {
      return Date.from(source.toInstant(ZoneOffset.UTC));
    }
  }

  static final class LocalDateTimeReadConverter implements Converter<Date, LocalDateTime> {

    @Override
    public LocalDateTime convert(Date source) {
      return LocalDateTime.ofInstant(source.toInstant(), ZoneOffset.UTC);
    }
  }
}
