package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class PrescriptionCreateRequest {

    private String patientId;

    private String doctorId;

    private String diagnosis;

    private String appointmentId;

    private String instructions;

    private String status;

    private List<PrescriptionItemCreateRequest> items;
}
