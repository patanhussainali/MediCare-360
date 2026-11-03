package com.medicare360.service;

import com.medicare360.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class UserCodeGenerator {
    private static final String LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private final SecureRandom random = new SecureRandom();
    private final UserRepository userRepository;

    public UserCodeGenerator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String nextCode() {
        for (int attempt = 0; attempt < 100; attempt++) {
            StringBuilder code = new StringBuilder(6);
            for (int i = 0; i < 3; i++) code.append(LETTERS.charAt(random.nextInt(LETTERS.length())));
            code.append(String.format("%03d", random.nextInt(1000)));
            String candidate = code.toString();
            if (!userRepository.existsByUserCode(candidate)) return candidate;
        }
        throw new IllegalStateException("Unable to allocate a unique user ID. Please try again.");
    }
}
