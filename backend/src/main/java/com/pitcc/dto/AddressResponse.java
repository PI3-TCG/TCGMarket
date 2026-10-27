package com.pitcc.dto;

import com.pitcc.model.DeliveryAddress;
import com.pitcc.model.UserAddress;

public record AddressResponse(
        String id,
        String label,
        String recipientName,
        String zipCode,
        String street,
        String number,
        boolean withoutNumber,
        String complement,
        String district,
        String city,
        String state,
        boolean primary
) {

    public static AddressResponse from(UserAddress saved) {
        DeliveryAddress address = saved.getAddress();

        return new AddressResponse(
                saved.getId(),
                saved.getLabel(),
                address.getRecipientName(),
                address.getZipCode(),
                address.getStreet(),
                address.getNumber(),
                address.isWithoutNumber(),
                address.getComplement(),
                address.getDistrict(),
                address.getCity(),
                address.getState(),
                saved.isPrimary()
        );
    }
}
