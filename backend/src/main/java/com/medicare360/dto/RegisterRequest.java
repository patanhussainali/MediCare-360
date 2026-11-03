package com.medicare360.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import com.medicare360.common.PhoneNumberValidator;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegisterRequest {

    private String email;

    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    private String fullName;

    @Pattern(regexp = PhoneNumberValidator.PATTERN, message = PhoneNumberValidator.MESSAGE)
    private String phoneNumber;

    private String role;
}
