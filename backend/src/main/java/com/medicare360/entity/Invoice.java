package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "invoices")
@Getter
@Setter
@NoArgsConstructor
public class Invoice extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("invoice_number")
    private String invoiceNumber;

    @Field("patient_id")
    private String patientId;

    @Field("patient_name")
    private String patientName;

    @Field("appointment_id")
    private String appointmentId;

    private String description;

    @Field("items_json")
    private String itemsJson = "[]";

    private double subtotal = 0.0;

    private double tax = 0.0;

    private double discount = 0.0;

    @Field("total_amount")
    private double totalAmount = 0.0;

    @Field("payment_status")
    private PaymentStatus paymentStatus;

    @Field("payment_method")
    private String paymentMethod;

    @Field("paid_at")
    private Instant paidAt;

    private String notes;
}
