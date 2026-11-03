package com.medicare360.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AppointmentStatusUpdateRequest {

    @NotNull
    private String status;

    private String notes;
}
