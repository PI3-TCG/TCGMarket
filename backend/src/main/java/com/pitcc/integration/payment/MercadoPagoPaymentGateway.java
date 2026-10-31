package com.pitcc.integration.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.pitcc.model.PaymentProvider;
import com.pitcc.model.PaymentStatus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Pix pelo Checkout Transparente (API de Orders) do Mercado Pago, só com
 * credenciais de teste. Mapeamento de status: spike #67, seção 5.
 */
public class MercadoPagoPaymentGateway implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(MercadoPagoPaymentGateway.class);

    private final RestClient client;
    private final String notificationUrl;
    private final String testPayerName;

    /** {@code client} já vem com a URL base e o cabeçalho de autorização. */
    public MercadoPagoPaymentGateway(RestClient client, String notificationUrl, String testPayerName) {
        this.client = client;
        this.notificationUrl = blankToNull(notificationUrl);
        this.testPayerName = blankToNull(testPayerName);
    }

    @Override
    public PaymentProvider provider() {
        return PaymentProvider.MERCADO_PAGO;
    }

    @Override
    public GatewayPayment create(PaymentRequest request) {
        String amount = request.amount().setScale(2, RoundingMode.HALF_UP).toPlainString();

        Map<String, Object> payer = new LinkedHashMap<>();
        payer.put("email", request.payerEmail());
        if (testPayerName != null) {
            payer.put("first_name", testPayerName);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("type", "online");
        body.put("external_reference", request.orderId());
        body.put("total_amount", amount);
        body.put("payer", payer);
        body.put("transactions", Map.of("payments", List.of(Map.of(
                "amount", amount,
                "payment_method", Map.of("id", "pix", "type", "bank_transfer")
        ))));
        if (notificationUrl != null) {
            body.put("notification_url", notificationUrl);
        }

        return call(() -> client.post()
                .uri("/v1/orders")
                .header("X-Idempotency-Key", request.idempotencyKey())
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(MercadoPagoOrder.class));
    }

    @Override
    public GatewayPayment fetch(String providerPaymentId) {
        return call(() -> client.get()
                .uri("/v1/orders/{id}", providerPaymentId)
                .retrieve()
                .body(MercadoPagoOrder.class));
    }

    private GatewayPayment call(OrderCall call) {
        MercadoPagoOrder order;
        try {
            order = call.execute();
        } catch (RestClientResponseException exception) {
            throw new PaymentGatewayException(
                    "Mercado Pago respondeu " + exception.getStatusCode().value() + ".", exception);
        } catch (RestClientException exception) {
            throw new PaymentGatewayException("Falha ao acessar o Mercado Pago.", exception);
        }

        if (order == null || order.id() == null) {
            throw new PaymentGatewayException("Resposta do Mercado Pago sem identificador.");
        }

        if (Boolean.TRUE.equals(order.liveMode())) {
            log.error("Mercado Pago respondeu em produção (live_mode). Verifique MP_ACCESS_TOKEN.");
            throw new PaymentGatewayException("Credencial de produção não é permitida.");
        }

        return new GatewayPayment(order.id(), status(order.status(), order.statusDetail()), order.statusDetail());
    }

    static PaymentStatus status(String status, String detail) {
        boolean expired = "expired".equals(detail);
        return switch (status == null ? "" : status) {
            case "processed" -> PaymentStatus.APPROVED;
            case "failed" -> expired ? PaymentStatus.EXPIRED : PaymentStatus.REJECTED;
            case "canceled" -> expired ? PaymentStatus.EXPIRED : PaymentStatus.CANCELLED;
            case "created", "processing", "action_required" -> PaymentStatus.PENDING;
            default -> {
                log.warn("Status do Mercado Pago fora do escopo: {}/{}", status, detail);
                yield PaymentStatus.PENDING;
            }
        };
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    @FunctionalInterface
    private interface OrderCall {
        MercadoPagoOrder execute();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record MercadoPagoOrder(
            String id,
            String status,
            @JsonProperty("status_detail") String statusDetail,
            @JsonProperty("live_mode") Boolean liveMode
    ) {
    }
}
