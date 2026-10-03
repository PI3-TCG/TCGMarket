package com.pitcc.validation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.pitcc.dto.CreateUserRequest;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class MaxUtf8BytesValidatorTest {

  private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

  @Test
  void shouldAcceptAsciiPasswordWithin72Bytes() {
    String password = "A1!" + "a".repeat(69);

    assertEquals(72, password.getBytes(StandardCharsets.UTF_8).length);
    assertTrue(violationsFor(password).isEmpty());
  }

  @Test
  void shouldAcceptUnicodePasswordWithin72Bytes() {
    String password = "A1!" + "é".repeat(34);

    assertEquals(71, password.getBytes(StandardCharsets.UTF_8).length);
    assertTrue(violationsFor(password).isEmpty());
  }

  @Test
  void shouldRejectPasswordAbove72Utf8Bytes() {
    String password = "A1!" + "é".repeat(35);

    assertEquals(73, password.getBytes(StandardCharsets.UTF_8).length);
    assertTrue(
        violationsFor(password).stream()
            .anyMatch(
                violation ->
                    violation.getMessage().equals("A senha deve ter no máximo 72 bytes em UTF-8.")));
  }

  private java.util.Set<jakarta.validation.ConstraintViolation<CreateUserRequest>> violationsFor(
      String password) {
    return validator.validate(new CreateUserRequest("João Silva", "joao@email.com", password));
  }
}
