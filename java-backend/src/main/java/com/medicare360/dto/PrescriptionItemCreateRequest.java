package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PrescriptionItemCreateRequest {

    private String medicineName;

    private String dosage;

    private String frequency;

    private String duration;

    private String instructions;
}
