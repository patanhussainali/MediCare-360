package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "nurses")
@Getter
@Setter
@NoArgsConstructor
public class Nurse extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("nurse_id")
    private String nurseId;

    @Field("user_id")
    private String userId;

    @Field("department_id")
    private String departmentId;

    @Field("full_name")
    private String fullName;

    @Field("license_number")
    private String licenseNumber;

    private String shift = "Morning";

    private String phone;

    @Indexed(unique = true, sparse = true)
    private String email;

    private String status = "Active";
}
