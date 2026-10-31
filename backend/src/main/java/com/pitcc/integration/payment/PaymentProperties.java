package com.pitcc.integration.payment;

import com.pitcc.model.PaymentProvider;
import com.pitcc.model.PaymentStatus;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "payment")
public record PaymentProperties(
        PaymentProvider provider,
        Simulated simulated,
        MercadoPago mercadopago,
        Reconciliation reconciliation
) {

    /** {@code outcome} é o resultado de toda cobrança criada pelo simulador. */
    public record Simulated(PaymentStatus outcome) {
    }

    public record MercadoPago(
            String baseUrl,
            String accessToken,
            String webhookSecret,
            String notificationUrl,
            String testPayerName,
            Duration timeout
    ) {

        @Override
        public String toString() {
            return "MercadoPago[baseUrl=" + baseUrl
                    + ", accessToken=" + present(accessToken)
                    + ", webhookSecret=" + present(webhookSecret)
                    + ", notificationUrl=" + notificationUrl
                    + ", timeout=" + timeout + "]";
        }

        private static String present(String value) {
            return value != null && !value.isBlank() ? "present" : "absent";
        }
    }

    /** Pagamentos pendentes há mais de {@code pendingAfter} são consultados no gateway. */
    public record Reconciliation(boolean enabled, Duration interval, Duration pendingAfter) {
    }
}
