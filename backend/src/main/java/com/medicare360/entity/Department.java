package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "departments")
@Getter
@Setter
@NoArgsConstructor
public class Department extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    private String code;

    @Indexed(unique = true)
    private String name;

    private String description;

    @Field("head_of_department")
    private String headOfDepartment;

    private String status = "Active";

    @Field("is_active")
    private boolean isActive = true;
}
