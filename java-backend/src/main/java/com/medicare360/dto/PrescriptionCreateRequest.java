package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class PrescriptionCreateRequest {

    private Long patientId;

    private Long doctorId;

    private String diagnosis;

    private Long appointmentId;

    private String instructions;

    private String status;

    private List<PrescriptionItemCreateRequest> items;
}
