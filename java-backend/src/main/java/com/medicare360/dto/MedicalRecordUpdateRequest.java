package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MedicalRecordUpdateRequest {

    private Long patientId;

    private Long doctorId;

    private String diagnosis;

    private String visitDate;

    private String symptoms;

    private String examinationNotes;

    private String vitalSigns;

    private String attachments;
}
