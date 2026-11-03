package com.medicare360.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class InvoiceStatusUpdateRequest {

    @NotBlank
    private String paymentStatus;

    private String paymentMethod;
}
