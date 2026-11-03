package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
public class AuditLog extends BaseEntity {

    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("user_email")
    private String userEmail;

    @Field("user_name")
    private String userName = "System";

    private String action;

    private String resource;

    @Field("resource_id")
    private String resourceId;

    private String details;

    @Field("ip_address")
    private String ipAddress;

    @Field("user_agent")
    private String userAgent;
}
