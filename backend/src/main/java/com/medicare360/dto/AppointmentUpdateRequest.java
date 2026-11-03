package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AppointmentUpdateRequest {

    private Long patientId;

    private Long doctorId;

    private String appointmentDate;

    private String appointmentTime;

    private String type;

    private String reason;

    private String notes;

    private Long departmentId;

    private String status;
}
