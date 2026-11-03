package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class InvoiceCreateRequest {

    private Long patientId;

    private Long appointmentId;

    private String description;

    private List<Object> items;

    private Double subtotal;

    private Double tax;

    private Double discount;

    private Double totalAmount;

    private String paymentStatus;

    private String paymentMethod;

    private String notes;
}
