package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DepartmentUpdateRequest {

    private String name;

    private String code;

    private String description;

    private String headOfDepartment;

    private String status;

    private Boolean isActive;
}
