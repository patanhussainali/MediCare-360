package com.medicare360.common;

import com.medicare360.exception.BadRequestException;

public final class PhoneNumberValidator {
    public static final String PATTERN = "^(?:[0-9]{10})?$";
    public static final String MESSAGE = "Mobile number must contain exactly 10 digits.";

    private PhoneNumberValidator() {}

    public static void validateIfPresent(String phone) {
        if (phone != null && !phone.isBlank() && !phone.matches(PATTERN)) {
            throw new BadRequestException(MESSAGE);
        }
    }
}
