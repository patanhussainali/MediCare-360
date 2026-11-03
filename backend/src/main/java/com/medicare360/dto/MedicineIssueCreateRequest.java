package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MedicineIssueCreateRequest {

    private String medicineId;

    private String patientId;

    private int quantity;

    private String prescriptionId;

    private String notes;
}
