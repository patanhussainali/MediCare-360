package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MedicineIssueCreateRequest {

    private Long medicineId;

    private Long patientId;

    private int quantity;

    private Long prescriptionId;

    private String notes;
}
