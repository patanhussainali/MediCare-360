package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
public class Appointment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_number", unique = true, length = 50)
    private String appointmentNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "appointment_date", length = 50)
    private String appointmentDate;

    @Column(name = "appointment_time", length = 20)
    private String appointmentTime;

    @Column(length = 50)
    private String type = "General Consultation";

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Convert(converter = AppointmentStatusConverter.class)
    @Column(length = 20)
    private AppointmentStatus status;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
