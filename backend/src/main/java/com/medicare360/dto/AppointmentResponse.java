package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class AppointmentResponse {

    private Long id;

    private String appointmentNumber;

    private Long patientId;

    private String patientName;

    private Long doctorId;

    private String doctorName;

    private Long departmentId;

    private String departmentName;

    private String appointmentDate;

    private String appointmentTime;

    private String type;

    private String reason;

    private String status;

    private String notes;

    private Instant createdAt;

    private Instant updatedAt;
}
