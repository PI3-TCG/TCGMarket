package com.pitcc.controller;

import com.pitcc.integration.payment.MercadoPagoSignatureValidator;
import com.pitcc.service.PaymentService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Notificações do Mercado Pago. É público (o provedor não manda JWT), então
 * só a assinatura {@code x-signature} autoriza o processamento.
 */
@RestController
@RequestMapping("/api/payments/webhooks")
public class PaymentWebhookController {

    private static final Logger log = LoggerFactory.getLogger(PaymentWebhookController.class);

    private final MercadoPagoSignatureValidator signatureValidator;
    private final PaymentService paymentService;

    public PaymentWebhookController(
            MercadoPagoSignatureValidator signatureValidator,
            PaymentService paymentService
    ) {
        this.signatureValidator = signatureValidator;
        this.paymentService = paymentService;
    }

    @PostMapping("/mercadopago")
    public ResponseEntity<Void> mercadoPago(
            @RequestParam(name = "data.id", required = false) String dataId,
            @RequestHeader(name = "x-signature", required = false) String signature,
            @RequestHeader(name = "x-request-id", required = false) String requestId,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        if (!signatureValidator.isValid(signature, requestId, dataId, Instant.now())) {
            return ResponseEntity.status(401).build();
        }

        if (body != null && Boolean.TRUE.equals(body.get("live_mode"))) {
            log.error("Notificação do Mercado Pago em produção (live_mode) recusada.");
            return ResponseEntity.badRequest().build();
        }

        try {
            paymentService.handleNotification(dataId);
        } catch (OptimisticLockingFailureException concurrent) {
            log.info("Pagamento da cobrança {} atualizado ao mesmo tempo; ignorando.", dataId);
        }

        return ResponseEntity.ok().build();
    }
}
