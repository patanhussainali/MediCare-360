package com.medicare360.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import com.medicare360.common.PhoneNumberValidator;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PatientCreateRequest {

    @NotBlank
    private String fullName;

    @NotBlank
    private String gender;

    @NotBlank
    private String dateOfBirth;

    @NotBlank
    @Pattern(regexp = PhoneNumberValidator.PATTERN, message = PhoneNumberValidator.MESSAGE)
    private String phone;

    @NotBlank
    @Email
    private String email;

    private String bloodGroup;

    private String address;

    private String emergencyContact;

    private String allergies;

    private String chronicConditions;

    private String status;

    private String password;

    private String medicalRecordNumber;
}
