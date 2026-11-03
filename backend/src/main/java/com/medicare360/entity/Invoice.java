package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
public class Invoice extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", unique = true, length = 50)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "items_json", columnDefinition = "TEXT")
    private String itemsJson = "[]";

    private double subtotal = 0.0;

    private double tax = 0.0;

    private double discount = 0.0;

    @Column(name = "total_amount")
    private double totalAmount = 0.0;

    @Convert(converter = PaymentStatusConverter.class)
    @Column(name = "payment_status", length = 9)
    private PaymentStatus paymentStatus;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "paid_at", columnDefinition = "DATETIME")
    private Instant paidAt;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
