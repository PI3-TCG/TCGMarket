package com.pitcc.service;

import com.pitcc.dto.AddressRequest;
import com.pitcc.dto.AddressResponse;
import com.pitcc.exception.AddressConflictException;
import com.pitcc.exception.AddressNotFoundException;
import com.pitcc.model.DeliveryAddress;
import com.pitcc.model.UserAddress;
import com.pitcc.repository.UserAddressRepository;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

/**
 * Endereços de entrega do usuário autenticado. Cada usuário tem no máximo um
 * principal; o primeiro endereço cadastrado vira o principal.
 */
@Service
public class AddressService {

    public static final int MAX_ADDRESSES = 10;

    // Duas abas marcando principais diferentes ao mesmo tempo esbarram no índice único.
    private static final int MAX_ATTEMPTS = 3;

    private final UserAddressRepository addressRepository;

    public AddressService(UserAddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public List<AddressResponse> list(String userId) {
        return addressRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .sorted(Comparator.comparing(UserAddress::isPrimary).reversed())
                .map(AddressResponse::from)
                .toList();
    }

    public AddressResponse create(String userId, AddressRequest request) {
        DeliveryAddress address = toDeliveryAddress(request);
        long count = addressRepository.countByUserId(userId);

        if (count >= MAX_ADDRESSES) {
            throw new AddressConflictException(
                    "Você pode cadastrar até " + MAX_ADDRESSES + " endereços."
            );
        }

        boolean primary = request.isPrimary() || count == 0;
        UserAddress created = new UserAddress(userId, request.label(), address, primary, Instant.now());

        return AddressResponse.from(persist(created));
    }

    public AddressResponse update(String userId, String addressId, AddressRequest request) {
        DeliveryAddress address = toDeliveryAddress(request);
        UserAddress existing = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(AddressNotFoundException::new);

        existing.update(request.label(), address, request.isPrimary(), Instant.now());

        return AddressResponse.from(persist(existing));
    }

    private UserAddress persist(UserAddress address) {
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                if (address.isPrimary()) {
                    addressRepository.clearPrimaryExcept(address.getUserId(), address.getId());
                }

                return addressRepository.save(address);
            } catch (DuplicateKeyException exception) {
                if (attempt == MAX_ATTEMPTS) {
                    break;
                }
            } catch (OptimisticLockingFailureException exception) {
                throw new AddressConflictException(
                        "Este endereço foi alterado em outra aba. Recarregue a página e tente novamente."
                );
            }
        }

        throw new AddressConflictException(
                "Não foi possível definir o endereço principal agora. Tente novamente."
        );
    }

    private static DeliveryAddress toDeliveryAddress(AddressRequest request) {
        return new DeliveryAddress(
                request.recipientName(),
                request.zipCode(),
                request.street(),
                request.number(),
                request.isWithoutNumber(),
                request.complement(),
                request.district(),
                request.city(),
                request.state()
        );
    }
}
