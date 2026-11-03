package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "patients")
@Getter
@Setter
@NoArgsConstructor
public class Patient extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("patient_id")
    private String patientId;

    @Field("user_id")
    private String userId;

    @Field("full_name")
    private String fullName;

    private String gender;

    @Field("date_of_birth")
    private String dateOfBirth;

    @Field("blood_group")
    private String bloodGroup;

    private String phone;

    @Indexed(unique = true, sparse = true)
    private String email;

    private String address;

    @Field("emergency_contact")
    private String emergencyContact;

    private String allergies;

    @Field("chronic_conditions")
    private String chronicConditions;

    private String status = "Active";
}
