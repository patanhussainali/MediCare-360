package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "receptionists")
@Getter
@Setter
@NoArgsConstructor
public class Receptionist extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("receptionist_id")
    private String receptionistId;

    @Field("user_id")
    private String userId;

    @Field("full_name")
    private String fullName;

    private String shift = "Day";

    private String phone;

    @Indexed(unique = true, sparse = true)
    private String email;

    private String status = "Active";
}
