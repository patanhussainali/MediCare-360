package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class ReceptionistResponse {

    private Long id;

    private String receptionistId;

    private Long userId;

    private String fullName;

    private String shift;

    private String phone;

    private String email;

    private String status;

    private Instant createdAt;

    private Instant updatedAt;
}

