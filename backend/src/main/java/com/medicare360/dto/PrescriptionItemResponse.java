package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class PrescriptionItemResponse {

    private Long id;

    private Long prescriptionId;

    private String medicineName;

    private String dosage;

    private String frequency;

    private String duration;

    private String instructions;

    private Instant createdAt;
}
