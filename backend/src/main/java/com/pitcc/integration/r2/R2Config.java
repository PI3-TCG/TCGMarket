package com.pitcc.integration.r2;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(R2Properties.class)
public class R2Config {
  @Bean
  AvatarStorage avatarStorage(R2Properties properties) {
    if (!properties.configured()) return new DisabledAvatarStorage();
    return new R2AvatarStorage(properties);
  }
}
