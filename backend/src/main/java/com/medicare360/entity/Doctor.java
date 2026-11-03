package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "doctors")
@Getter
@Setter
@NoArgsConstructor
public class Doctor extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("doctor_id")
    private String doctorId;

    @Field("user_id")
    private String userId;

    @Field("department_id")
    private String departmentId;

    @Field("department_name")
    private String departmentName;

    @Field("full_name")
    private String fullName;

    private String specialization;

    private String qualification;

    @Field("experience_years")
    private int experienceYears = 0;

    @Field("consultation_fee")
    private double consultationFee = 50.0;

    @Field("available_days")
    private String availableDays;

    private String phone;

    @Indexed(unique = true, sparse = true)
    private String email;

    private String status = "Available";
}
