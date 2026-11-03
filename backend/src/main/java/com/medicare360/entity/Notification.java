package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification extends BaseEntity {

    @Id
    private String id;

    @Field("user_id")
    private String userId;

    private String title;

    private String message;

    private String type = "INFO";

    @Field("is_read")
    private boolean isRead = false;

    private String link;

    @Field("read_at")
    private Instant readAt;
}
