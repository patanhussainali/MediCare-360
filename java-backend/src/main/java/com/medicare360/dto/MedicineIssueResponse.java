package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class MedicineIssueResponse {

    private Long id;

    private Long medicineId;

    private String medicineName;

    private Long patientId;

    private String patientName;

    private Long prescriptionId;

    private int quantity;

    private String dispensedBy;

    private Instant dispensedAt;

    private String notes;

    private Instant createdAt;
}
