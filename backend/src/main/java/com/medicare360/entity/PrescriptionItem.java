package com.medicare360.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Embedded subdocument within Prescription. Not a top-level @Document.
 */
@Getter
@Setter
@NoArgsConstructor
public class PrescriptionItem {

    private String medicineName;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
}
