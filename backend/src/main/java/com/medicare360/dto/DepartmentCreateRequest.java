package com.medicare360.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DepartmentCreateRequest {

    @NotBlank
    private String name;

    private String code;

    private String description;

    private String headOfDepartment;

    private String status;

    private Boolean isActive;
}
