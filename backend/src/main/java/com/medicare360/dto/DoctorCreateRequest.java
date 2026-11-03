package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.Pattern;
import com.medicare360.common.PhoneNumberValidator;

@Getter
@Setter
@NoArgsConstructor
public class DoctorCreateRequest {

    private String fullName;

    private String specialization;

    private String qualification;

    @Pattern(regexp = PhoneNumberValidator.PATTERN, message = PhoneNumberValidator.MESSAGE)
    private String phone;

    private String email;

    private Long departmentId;

    private String department;

    private Integer experienceYears;

    private Double consultationFee;

    private String availableDays;

    private String status;

    private String password;
}
