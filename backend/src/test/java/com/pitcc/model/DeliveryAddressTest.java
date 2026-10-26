package com.pitcc.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DeliveryAddressTest {

    private DeliveryAddress address(String zipCode, String number, boolean withoutNumber, String state) {
        return new DeliveryAddress(
                "Ana Souza", zipCode, "Rua A", number, withoutNumber,
                "  ", "Centro", "Campinas", state
        );
    }

    @Test
    void normalizesZipCodeStateAndBlankComplement() {
        DeliveryAddress address = address("13010-000", "12", false, " sp ");

        assertEquals("13010000", address.getZipCode());
        assertEquals("SP", address.getState());
        assertNull(address.getComplement());
    }

    @Test
    void withoutNumberIgnoresNumber() {
        DeliveryAddress address = address("13010000", "12", true, "SP");

        assertTrue(address.isWithoutNumber());
        assertNull(address.getNumber());
    }

    @Test
    void validatesRequiredFields() {
        assertEquals(
                "Informe um CEP com 8 dígitos.",
                assertThrows(IllegalArgumentException.class, () ->
                        address("1301", "12", false, "SP")
                ).getMessage()
        );

        assertThrows(IllegalArgumentException.class, () ->
                address("13010000", " ", false, "SP")
        );

        assertEquals(
                "Informe uma UF válida.",
                assertThrows(IllegalArgumentException.class, () ->
                        address("13010000", "12", false, "XX")
                ).getMessage()
        );
    }
}
