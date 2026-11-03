package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AppointmentCreateRequest {

    private String patientId;

    private String doctorId;

    private String appointmentDate;

    private String appointmentTime;

    private String type;

    private String reason;

    private String notes;

    private String departmentId;

    private String status;
}
