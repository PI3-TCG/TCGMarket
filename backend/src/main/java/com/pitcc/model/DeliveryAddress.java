package com.pitcc.model;

import java.util.Set;

/**
 * Endereço de entrega confirmado no checkout.
 * Fica copiado no pedido para que editar ou apagar o endereço do usuário
 * não altere uma compra já feita.
 */
public class DeliveryAddress {

    private static final Set<String> STATES = Set.of(
            "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
            "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
            "RS", "RO", "RR", "SC", "SP", "SE", "TO"
    );

    private String recipientName;
    private String zipCode;
    private String street;
    private String number;
    private boolean withoutNumber;
    private String complement;
    private String district;
    private String city;
    private String state;

    protected DeliveryAddress() {
    }

    public DeliveryAddress(
            String recipientName,
            String zipCode,
            String street,
            String number,
            boolean withoutNumber,
            String complement,
            String district,
            String city,
            String state
    ) {
        this.recipientName = required(recipientName, "Informe o nome do destinatário.");
        this.street = required(street, "Informe a rua ou avenida.");
        this.district = required(district, "Informe o bairro.");
        this.city = required(city, "Informe a cidade.");

        String digits = zipCode == null ? "" : zipCode.replaceAll("\\D", "");

        if (digits.length() != 8) {
            throw new IllegalArgumentException("Informe um CEP com 8 dígitos.");
        }

        this.zipCode = digits;

        if (withoutNumber) {
            this.number = null;
        } else {
            this.number = required(number, "Informe o número ou marque \"Sem número\".");
        }

        this.withoutNumber = withoutNumber;

        if (state == null || !STATES.contains(state.strip().toUpperCase())) {
            throw new IllegalArgumentException("Informe uma UF válida.");
        }

        this.state = state.strip().toUpperCase();
        this.complement = complement == null || complement.isBlank()
                ? null
                : complement.strip();
    }

    private static String required(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        return value.strip();
    }

    public String getRecipientName() {
        return recipientName;
    }

    public String getZipCode() {
        return zipCode;
    }

    public String getStreet() {
        return street;
    }

    public String getNumber() {
        return number;
    }

    public boolean isWithoutNumber() {
        return withoutNumber;
    }

    public String getComplement() {
        return complement;
    }

    public String getDistrict() {
        return district;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }
}
