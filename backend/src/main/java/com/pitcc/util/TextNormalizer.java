package com.pitcc.util;

public final class TextNormalizer {

    private TextNormalizer() {
    }

    public static String normalizeOptionalText(String value) {
        return (value == null || value.isBlank())
                ? null
                : value.strip();
    }
}
