package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class PrescriptionResponse {

    private String id;

    private String prescriptionNumber;

    private String patientId;

    private String patientName;

    private String doctorId;

    private String doctorName;

    private String appointmentId;

    private String diagnosis;

    private String instructions;

    private String status;

    private List<PrescriptionItemResponse> items;

    private Instant createdAt;

    private Instant updatedAt;
}
