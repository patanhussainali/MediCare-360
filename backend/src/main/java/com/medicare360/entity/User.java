package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
public class User extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    @Indexed(unique = true, sparse = true)
    @Field("user_code")
    private String userCode;

    @Field("hashed_password")
    private String hashedPassword;

    @Field("full_name")
    private String fullName;

    private UserRole role;

    private String phone;

    private String department;

    @Field("is_active")
    private boolean isActive = true;

    @Field("is_verified")
    private boolean isVerified = false;

    @Field("last_login")
    private Instant lastLogin;
}
