package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "appointments")
@Getter
@Setter
@NoArgsConstructor
public class Appointment extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("appointment_number")
    private String appointmentNumber;

    @Field("patient_id")
    private String patientId;

    @Field("patient_name")
    private String patientName;

    @Field("doctor_id")
    private String doctorId;

    @Field("doctor_name")
    private String doctorName;

    @Field("department_id")
    private String departmentId;

    @Field("department_name")
    private String departmentName;

    @Field("appointment_date")
    private String appointmentDate;

    @Field("appointment_time")
    private String appointmentTime;

    private String type = "General Consultation";

    private String reason;

    private AppointmentStatus status;

    private String notes;
}
