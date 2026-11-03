package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.Pattern;
import com.medicare360.common.PhoneNumberValidator;

@Getter
@Setter
@NoArgsConstructor
public class ReceptionistUpdateRequest {

    private String shift;

    private String status;

    @Pattern(regexp = PhoneNumberValidator.PATTERN, message = PhoneNumberValidator.MESSAGE)
    private String phone;
}

