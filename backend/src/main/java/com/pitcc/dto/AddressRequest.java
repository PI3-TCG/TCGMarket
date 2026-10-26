package com.pitcc.dto;

import com.pitcc.model.UserAddress;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddressRequest(
        @Size(max = UserAddress.LABEL_MAX_LENGTH, message = "Use até 30 caracteres na identificação.")
        String label,

        @NotBlank(message = "Informe o nome do destinatário.")
        @Size(max = 100, message = "Use até 100 caracteres no nome do destinatário.")
        String recipientName,

        @NotBlank(message = "Informe um CEP com 8 dígitos.")
        @Pattern(regexp = "\\d{5}-?\\d{3}", message = "Informe um CEP com 8 dígitos.")
        String zipCode,

        @NotBlank(message = "Informe a rua ou avenida.")
        @Size(max = 120, message = "Use até 120 caracteres na rua ou avenida.")
        String street,

        @Size(max = 10, message = "Use até 10 caracteres no número.")
        String number,

        Boolean withoutNumber,

        @Size(max = 60, message = "Use até 60 caracteres no complemento.")
        String complement,

        @NotBlank(message = "Informe o bairro.")
        @Size(max = 80, message = "Use até 80 caracteres no bairro.")
        String district,

        @NotBlank(message = "Informe a cidade.")
        @Size(max = 80, message = "Use até 80 caracteres na cidade.")
        String city,

        @NotBlank(message = "Informe uma UF válida.")
        String state,

        Boolean primary
) {

    public boolean isWithoutNumber() {
        return Boolean.TRUE.equals(withoutNumber);
    }

    public boolean isPrimary() {
        return Boolean.TRUE.equals(primary);
    }
}
