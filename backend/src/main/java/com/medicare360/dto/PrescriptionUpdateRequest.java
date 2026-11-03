package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PrescriptionUpdateRequest {

    private String diagnosis;

    private String instructions;

    private String status;
}
