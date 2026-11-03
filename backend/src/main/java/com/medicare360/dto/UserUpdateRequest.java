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
public class UserUpdateRequest {

    @JsonAlias({"fullName", "full_name", "name"})
    private String fullName;

    @JsonAlias({"phoneNumber", "phone_number", "phone"})
    @Pattern(regexp = PhoneNumberValidator.PATTERN, message = PhoneNumberValidator.MESSAGE)
    private String phone;

    private Boolean isActive;

    private String role;

    private String department;

    private String password;
}
