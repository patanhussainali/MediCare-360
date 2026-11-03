package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class InvoiceResponse {

    private Long id;

    private String invoiceNumber;

    private Long patientId;

    private String patientName;

    private Long appointmentId;

    private String description;

    private List<Object> items;

    private double subtotal;

    private double tax;

    private double discount;

    private double totalAmount;

    private String paymentStatus;

    private String paymentMethod;

    private Instant paidAt;

    private String notes;

    private Instant createdAt;

    private Instant updatedAt;
}
