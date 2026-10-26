package com.pitcc.service;

import com.pitcc.dto.AddressRequest;
import com.pitcc.dto.AddressResponse;
import com.pitcc.exception.AddressConflictException;
import com.pitcc.exception.AddressNotFoundException;
import com.pitcc.model.DeliveryAddress;
import com.pitcc.model.UserAddress;
import com.pitcc.repository.UserAddressRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.OptimisticLockingFailureException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AddressServiceTest {

    private static final Instant NOW = Instant.parse("2026-10-26T12:00:00Z");

    @Mock
    private UserAddressRepository addressRepository;

    @InjectMocks
    private AddressService addressService;

    private static AddressRequest request(boolean primary) {
        return new AddressRequest(
                "Casa", "Ana Souza", "13010-000", "Rua A", "12", false,
                null, "Centro", "Campinas", "sp", primary
        );
    }

    private static UserAddress stored(String userId, boolean primary) {
        return new UserAddress(
                userId,
                "Casa",
                new DeliveryAddress("Ana Souza", "13010000", "Rua A", "12", false, null, "Centro", "Campinas", "SP"),
                primary,
                NOW
        );
    }

    @Test
    void firstAddressBecomesPrimary() {
        when(addressRepository.countByUserId("u1")).thenReturn(0L);
        when(addressRepository.save(any(UserAddress.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AddressResponse created = addressService.create("u1", request(false));

        assertTrue(created.primary());
        assertEquals("13010000", created.zipCode());
        assertEquals("SP", created.state());
        verify(addressRepository).clearPrimaryExcept(eq("u1"), isNull());
    }

    @Test
    void laterAddressIsNotPrimaryUnlessRequested() {
        when(addressRepository.countByUserId("u1")).thenReturn(2L);
        when(addressRepository.save(any(UserAddress.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AddressResponse created = addressService.create("u1", request(false));

        assertFalse(created.primary());
        verify(addressRepository, never()).clearPrimaryExcept(anyString(), any());
    }

    @Test
    void newPrimaryClearsThePreviousOne() {
        when(addressRepository.countByUserId("u1")).thenReturn(2L);
        when(addressRepository.save(any(UserAddress.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertTrue(addressService.create("u1", request(true)).primary());
        verify(addressRepository).clearPrimaryExcept(eq("u1"), isNull());
    }

    @Test
    void limitsAddressesPerUser() {
        when(addressRepository.countByUserId("u1")).thenReturn((long) AddressService.MAX_ADDRESSES);

        AddressConflictException exception = assertThrows(AddressConflictException.class, () ->
                addressService.create("u1", request(false))
        );

        assertEquals("Você pode cadastrar até 10 endereços.", exception.getMessage());
        verify(addressRepository, never()).save(any());
    }

    @Test
    void invalidAddressReportsTheField() {
        AddressRequest withoutNumber = new AddressRequest(
                null, "Ana Souza", "13010000", "Rua A", " ", false,
                null, "Centro", "Campinas", "SP", false
        );

        DeliveryAddress.InvalidFieldException exception = assertThrows(
                DeliveryAddress.InvalidFieldException.class,
                () -> addressService.create("u1", withoutNumber)
        );

        assertEquals("number", exception.getField());
        verify(addressRepository, never()).save(any());
    }

    @Test
    void updatesOnlyTheOwnersAddress() {
        when(addressRepository.findByIdAndUserId("a1", "u2")).thenReturn(Optional.empty());

        assertThrows(AddressNotFoundException.class, () ->
                addressService.update("u2", "a1", request(false))
        );
        verify(addressRepository, never()).save(any());
    }

    @Test
    void updateCanRemoveThePrimaryFlag() {
        UserAddress existing = stored("u1", true);
        when(addressRepository.findByIdAndUserId("a1", "u1")).thenReturn(Optional.of(existing));
        when(addressRepository.save(existing)).thenReturn(existing);

        AddressResponse updated = addressService.update("u1", "a1", request(false));

        assertFalse(updated.primary());
    }

    @Test
    void retriesWhenAnotherPrimaryWasSavedConcurrently() {
        when(addressRepository.countByUserId("u1")).thenReturn(1L);
        when(addressRepository.save(any(UserAddress.class)))
                .thenThrow(new DuplicateKeyException("primary"))
                .thenAnswer(invocation -> invocation.getArgument(0));

        assertTrue(addressService.create("u1", request(true)).primary());
        verify(addressRepository, times(2)).clearPrimaryExcept(eq("u1"), isNull());
    }

    @Test
    void reportsConflictWhenPrimaryKeepsColliding() {
        when(addressRepository.countByUserId("u1")).thenReturn(1L);
        when(addressRepository.save(any(UserAddress.class))).thenThrow(new DuplicateKeyException("primary"));

        assertThrows(AddressConflictException.class, () -> addressService.create("u1", request(true)));
    }

    @Test
    void reportsConflictWhenTheAddressChangedInAnotherTab() {
        UserAddress existing = stored("u1", false);
        when(addressRepository.findByIdAndUserId("a1", "u1")).thenReturn(Optional.of(existing));
        when(addressRepository.save(existing)).thenThrow(new OptimisticLockingFailureException("version"));

        assertThrows(AddressConflictException.class, () ->
                addressService.update("u1", "a1", request(false))
        );
    }

    @Test
    void listsPrimaryFirst() {
        UserAddress work = stored("u1", false);
        UserAddress home = stored("u1", true);
        when(addressRepository.findByUserIdOrderByCreatedAtAsc("u1")).thenReturn(List.of(work, home));

        List<AddressResponse> addresses = addressService.list("u1");

        assertTrue(addresses.get(0).primary());
        assertFalse(addresses.get(1).primary());
    }
}
