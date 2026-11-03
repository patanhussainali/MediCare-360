package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class MedicalRecordResponse {

    private String id;

    private String recordNumber;

    private String patientId;

    private String patientName;

    private String patientCode;

    private String doctorId;

    private String doctorName;

    private String diagnosis;

    private String symptoms;

    private String examinationNotes;

    private String vitalSigns;

    private String attachments;

    private String visitDate;

    private Instant createdAt;

    private Instant updatedAt;
}
