package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "medical_records")
@Getter
@Setter
@NoArgsConstructor
public class MedicalRecord extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("record_number")
    private String recordNumber;

    @Field("patient_id")
    private String patientId;

    @Field("patient_name")
    private String patientName;

    @Field("patient_code")
    private String patientCode;

    @Field("doctor_id")
    private String doctorId;

    @Field("doctor_name")
    private String doctorName;

    private String diagnosis;

    private String symptoms;

    @Field("examination_notes")
    private String examinationNotes;

    @Field("vital_signs")
    private String vitalSigns;

    private String attachments;

    @Field("visit_date")
    private String visitDate;
}
