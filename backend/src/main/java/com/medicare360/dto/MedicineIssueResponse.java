package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class MedicineIssueResponse {

    private String id;

    private String medicineId;

    private String medicineName;

    private String patientId;

    private String patientName;

    private String prescriptionId;

    private int quantity;

    private String dispensedBy;

    private Instant dispensedAt;

    private String notes;

    private Instant createdAt;
}
