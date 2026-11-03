package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class DepartmentResponse {

    private Long id;

    private String code;

    private String name;

    private String description;

    private String headOfDepartment;

    private String status;

    private boolean isActive;

    private Instant createdAt;

    private Instant updatedAt;
}
