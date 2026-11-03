package com.medicare360.security;

import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenBlacklistService {

    private final Set<String> blacklistedJtis = ConcurrentHashMap.newKeySet();

    /** Add a JTI to the blacklist. */
    public void blacklist(String jti) {
        if (jti != null) {
            blacklistedJtis.add(jti);
        }
    }

    /** Check whether a JTI has been blacklisted. */
    public boolean isBlacklisted(String jti) {
        return jti != null && blacklistedJtis.contains(jti);
    }
}
