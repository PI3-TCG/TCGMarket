package com.pitcc.integration.r2;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.r2")
public record R2Properties(
    String accountId,
    String accessKeyId,
    String secretAccessKey,
    String bucket,
    String endpoint) {

  public boolean configured() {
    return present(accessKeyId) && present(secretAccessKey) && present(bucket) && present(endpoint);
  }

  private static boolean present(String value) {
    return value != null && !value.isBlank();
  }

  @Override
  public String toString() {
    return "R2Properties[bucket=" + bucket + ", endpoint=" + endpoint
        + ", accessKeyId=" + (present(accessKeyId) ? "present" : "absent")
        + ", secretAccessKey=" + (present(secretAccessKey) ? "present" : "absent") + "]";
  }
}
