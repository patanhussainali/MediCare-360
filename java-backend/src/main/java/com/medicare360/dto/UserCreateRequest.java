package com.medicare360.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.Pattern;
import com.medicare360.common.PhoneNumberValidator;

@Getter
@Setter
@NoArgsConstructor
public class UserCreateRequest {

    private String email;

    private String password;

    @JsonAlias({"fullName", "full_name", "name"})
    private String fullName;

    private String role;

    @JsonAlias({"phoneNumber", "phone_number", "phone"})
    @Pattern(regexp = PhoneNumberValidator.PATTERN, message = PhoneNumberValidator.MESSAGE)
    private String phoneNumber;

    private String department;
}
