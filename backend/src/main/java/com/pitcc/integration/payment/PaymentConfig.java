package com.pitcc.integration.payment;

import com.pitcc.model.PaymentProvider;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
@EnableScheduling
@EnableConfigurationProperties(PaymentProperties.class)
public class PaymentConfig {

    private static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(10);

    @Bean
    PaymentGateway paymentGateway(PaymentProperties properties) {
        if (properties.provider() != PaymentProvider.MERCADO_PAGO) {
            return new SimulatedPaymentGateway(
                    properties.simulated() == null ? null : properties.simulated().outcome()
            );
        }

        PaymentProperties.MercadoPago mp = properties.mercadopago();
        if (mp == null || mp.accessToken() == null || mp.accessToken().isBlank()) {
            throw new IllegalStateException(
                    "payment.provider=mercadopago exige MP_ACCESS_TOKEN (credencial de teste)."
            );
        }

        return new MercadoPagoPaymentGateway(
                mercadoPagoClient(mp).build(),
                mp.notificationUrl(),
                mp.testPayerName()
        );
    }

    @Bean
    MercadoPagoSignatureValidator mercadoPagoSignatureValidator(PaymentProperties properties) {
        PaymentProperties.MercadoPago mp = properties.mercadopago();
        return new MercadoPagoSignatureValidator(mp == null ? null : mp.webhookSecret());
    }

    static RestClient.Builder mercadoPagoClient(PaymentProperties.MercadoPago mp) {
        Duration timeout = mp.timeout() == null ? DEFAULT_TIMEOUT : mp.timeout();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(
                HttpClient.newBuilder().connectTimeout(timeout).build()
        );
        requestFactory.setReadTimeout(timeout);

        return RestClient.builder()
                .baseUrl(mp.baseUrl())
                .requestFactory(requestFactory)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + mp.accessToken().trim());
    }
}
