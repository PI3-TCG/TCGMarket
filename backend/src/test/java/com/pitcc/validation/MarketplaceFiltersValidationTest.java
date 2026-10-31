package com.pitcc.validation;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.pitcc.dto.MarketplaceFilters;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class MarketplaceFiltersValidationTest {

  private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

  private boolean isValid(String minPrice, String maxPrice) {
    MarketplaceFilters filters =
        new MarketplaceFilters(
            null, null, null, null, null, null, null,
            minPrice == null ? null : new BigDecimal(minPrice),
            maxPrice == null ? null : new BigDecimal(maxPrice));
    return validator.validate(filters).isEmpty();
  }

  @Test
  void shouldAcceptPricesUpToAdLimit() {
    assertTrue(isValid("0.00", "999999.99"));
    assertTrue(isValid("10.00", "10.00"));
    assertTrue(isValid(null, null));
  }

  @Test
  void shouldRejectPricesAboveAdLimit() {
    assertFalse(isValid(null, "1000000.00"));
    assertFalse(isValid("1000000.00", null));
  }

  @Test
  void shouldRejectNegativePriceAndInvertedRange() {
    assertFalse(isValid("-1.00", null));
    assertFalse(isValid("20.00", "10.00"));
  }
}
