package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "medicine_issue_records")
@Getter
@Setter
@NoArgsConstructor
public class MedicineIssueRecord extends BaseEntity {

    @Id
    private String id;

    @Field("prescription_id")
    private String prescriptionId;

    @Field("medicine_id")
    private String medicineId;

    @Field("medicine_name")
    private String medicineName;

    @Field("patient_id")
    private String patientId;

    @Field("patient_name")
    private String patientName;

    private int quantity;

    @Field("dispensed_by")
    private String dispensedBy;

    @Field("dispensed_at")
    private Instant dispensedAt;

    private String notes;
}
