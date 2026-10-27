package com.pitcc.repository;

import com.pitcc.model.DeliveryAddress;
import com.pitcc.model.UserAddress;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class UserAddressRepositoryIntegrationTest {

    private static final Instant NOW = Instant.parse("2026-10-26T12:00:00Z");

    @Autowired
    private UserAddressRepository addressRepository;

    private String userId;
    private String otherUserId;

    @BeforeEach
    void setUp() {
        userId = "address-user-" + UUID.randomUUID();
        otherUserId = "address-other-" + UUID.randomUUID();
    }

    @AfterEach
    void tearDown() {
        addressRepository.deleteAll(addressRepository.findByUserIdOrderByCreatedAtAsc(userId));
        addressRepository.deleteAll(addressRepository.findByUserIdOrderByCreatedAtAsc(otherUserId));
    }

    private static DeliveryAddress address(String street) {
        return new DeliveryAddress(
                "Ana Souza", "13010-000", street, "12", false,
                null, "Centro", "Campinas", "SP"
        );
    }

    @Test
    void rejectsSecondPrimaryForTheSameUser() {
        addressRepository.save(new UserAddress(userId, "Casa", address("Rua A"), true, NOW));

        assertThrows(DuplicateKeyException.class, () ->
                addressRepository.save(new UserAddress(userId, "Trabalho", address("Rua B"), true, NOW))
        );
    }

    @Test
    void allowsManyNonPrimaryAddressesAndOnePrimaryPerUser() {
        addressRepository.save(new UserAddress(userId, "Casa", address("Rua A"), true, NOW));
        addressRepository.save(new UserAddress(userId, null, address("Rua B"), false, NOW));
        addressRepository.save(new UserAddress(userId, null, address("Rua C"), false, NOW));
        addressRepository.save(new UserAddress(otherUserId, null, address("Rua D"), true, NOW));

        assertEquals(3, addressRepository.countByUserId(userId));
        assertEquals(1, addressRepository.countByUserId(otherUserId));
    }

    @Test
    void clearPrimaryExceptKeepsTheGivenAddressAndOtherUsers() {
        UserAddress home = addressRepository.save(new UserAddress(userId, "Casa", address("Rua A"), true, NOW));
        UserAddress other = addressRepository.save(
                new UserAddress(otherUserId, null, address("Rua D"), true, NOW)
        );

        assertEquals(0, addressRepository.clearPrimaryExcept(userId, home.getId()));
        assertEquals(1, addressRepository.clearPrimaryExcept(userId, null));

        assertFalse(addressRepository.findById(home.getId()).orElseThrow().isPrimary());
        assertTrue(addressRepository.findById(other.getId()).orElseThrow().isPrimary());
    }

    @Test
    void findsAddressOnlyForItsOwner() {
        UserAddress home = addressRepository.save(new UserAddress(userId, "Casa", address("Rua A"), true, NOW));

        assertTrue(addressRepository.findByIdAndUserId(home.getId(), userId).isPresent());
        assertTrue(addressRepository.findByIdAndUserId(home.getId(), otherUserId).isEmpty());
    }

    @Test
    void persistsTheDeliveryAddressFields() {
        UserAddress saved = addressRepository.save(new UserAddress(
                userId,
                "Trabalho",
                new DeliveryAddress("Ana Souza", "01000000", "Rua B", null, true, "Sala 2", "Sé", "São Paulo", "SP"),
                false,
                NOW
        ));

        DeliveryAddress loaded = addressRepository.findById(saved.getId()).orElseThrow().getAddress();

        assertEquals("01000000", loaded.getZipCode());
        assertTrue(loaded.isWithoutNumber());
        assertNull(loaded.getNumber());
        assertEquals("Sala 2", loaded.getComplement());
    }
}
