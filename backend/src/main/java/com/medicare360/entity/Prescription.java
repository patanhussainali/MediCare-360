package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "prescriptions")
@Getter
@Setter
@NoArgsConstructor
public class Prescription extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("prescription_number")
    private String prescriptionNumber;

    @Field("patient_id")
    private String patientId;

    @Field("patient_name")
    private String patientName;

    @Field("doctor_id")
    private String doctorId;

    @Field("doctor_name")
    private String doctorName;

    @Field("appointment_id")
    private String appointmentId;

    private String diagnosis;

    private String instructions;

    private String status = "Active";

    /** Embedded prescription items — no separate collection needed */
    private List<PrescriptionItem> items = new ArrayList<>();
}
