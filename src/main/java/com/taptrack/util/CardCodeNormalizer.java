package com.taptrack.util;

import org.springframework.stereotype.Component;

/** Trim + uppercase + bỏ khoảng trắng và ký tự phân cách. */
@Component
public class CardCodeNormalizer {
    public String normalize(String raw) {
        if (raw == null) return null;
        return raw.replaceAll("[\\s\\-:_\\.]", "").toUpperCase();
    }
}