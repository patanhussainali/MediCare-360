package com.medicare360.service;

import com.medicare360.entity.User;
import com.medicare360.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/** Assigns public user codes to existing accounts while preserving MongoDB document IDs. */
@Component
public class UserCodeMigration implements ApplicationRunner {
    private static final Pattern VALID_USER_CODE = Pattern.compile("^[A-Z]{3}[0-9]{3}$");

    private final UserRepository userRepository;
    private final UserCodeGenerator userCodeGenerator;

    public UserCodeMigration(UserRepository userRepository, UserCodeGenerator userCodeGenerator) {
        this.userRepository = userRepository;
        this.userCodeGenerator = userCodeGenerator;
    }

    @Override
    public void run(ApplicationArguments args) {
        for (User user : userRepository.findAll()) {
            String code = user.getUserCode();
            if (code == null || !VALID_USER_CODE.matcher(code).matches()) {
                user.setUserCode(userCodeGenerator.nextCode());
                userRepository.save(user);
            }
        }
    }
}
