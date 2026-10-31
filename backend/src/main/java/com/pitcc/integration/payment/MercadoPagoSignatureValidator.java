package com.pitcc.integration.payment;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Locale;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 * Valida o cabeçalho {@code x-signature} ({@code ts=...,v1=...}) das
 * notificações do Mercado Pago: HMAC-SHA256 do manifesto
 * {@code id:<data.id>;request-id:<x-request-id>;ts:<ts>;} com a chave secreta.
 */
public class MercadoPagoSignatureValidator {

    private static final Duration TOLERANCE = Duration.ofMinutes(5);
    private static final long MILLIS_THRESHOLD = 100_000_000_000L;

    private final byte[] secret;

    public MercadoPagoSignatureValidator(String secret) {
        this.secret = secret == null || secret.isBlank()
                ? null
                : secret.trim().getBytes(StandardCharsets.UTF_8);
    }

    public boolean isValid(String signature, String requestId, String dataId, Instant now) {
        if (secret == null || signature == null || requestId == null || dataId == null) {
            return false;
        }

        String ts = null;
        String v1 = null;
        for (String part : signature.split(",")) {
            String[] pair = part.trim().split("=", 2);
            if (pair.length != 2) {
                continue;
            }
            if (pair[0].equals("ts")) {
                ts = pair[1].trim();
            } else if (pair[0].equals("v1")) {
                v1 = pair[1].trim();
            }
        }

        if (ts == null || v1 == null || !recent(ts, now)) {
            return false;
        }

        String manifest = "id:" + dataId.toLowerCase(Locale.ROOT)
                + ";request-id:" + requestId
                + ";ts:" + ts + ";";

        byte[] expected = HexFormat.of().formatHex(hmac(manifest)).getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, v1.toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8));
    }

    private static boolean recent(String ts, Instant now) {
        long value;
        try {
            value = Long.parseLong(ts);
        } catch (NumberFormatException exception) {
            return false;
        }
        Instant sentAt = value >= MILLIS_THRESHOLD ? Instant.ofEpochMilli(value) : Instant.ofEpochSecond(value);
        return Duration.between(sentAt, now).abs().compareTo(TOLERANCE) <= 0;
    }

    private byte[] hmac(String manifest) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return mac.doFinal(manifest.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException | InvalidKeyException exception) {
            throw new IllegalStateException("HMAC-SHA256 indisponível.", exception);
        }
    }
}
