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

    private Long id;

    private String prescriptionNumber;

    private Long patientId;

    private String patientName;

    private Long doctorId;

    private String doctorName;

    private Long appointmentId;

    private String diagnosis;

    private String instructions;

    private String status;

    private List<PrescriptionItemResponse> items;

    private Instant createdAt;

    private Instant updatedAt;
}
