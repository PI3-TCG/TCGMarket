package com.pitcc.model;

import java.math.BigDecimal;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

/** Valor combinado entre as partes; NAO representa pagamento executado. */
public class FinancialAdjustment {

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal amount;
    private String currency;
    private String payerId;
    private String payeeId;

    protected FinancialAdjustment() {
    }

    public FinancialAdjustment(BigDecimal amount, String currency,
                               String payerId, String payeeId) {
        if (amount == null || amount.signum() <= 0 || amount.scale() > 2) {
            throw new IllegalArgumentException("O complemento deve ser positivo e ter no maximo duas casas decimais.");
        }
        if (!"BRL".equals(currency)) {
            throw new IllegalArgumentException("A moeda aceita nesta etapa e BRL.");
        }
        if (blank(payerId) || blank(payeeId) || payerId.equals(payeeId)) {
            throw new IllegalArgumentException("Informe pagador e recebedor diferentes.");
        }
        this.amount = amount;
        this.currency = currency;
        this.payerId = payerId;
        this.payeeId = payeeId;
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }

    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getPayerId() { return payerId; }
    public String getPayeeId() { return payeeId; }
}
