package com.medicare360.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class StaffScheduleCreateRequest {

    @NotBlank
    private String staffType;

    @NotNull
    private Long staffId;

    @NotBlank
    private String staffName;

    @NotBlank
    private String dayOfWeek;

    @NotBlank
    private String shiftStart;

    @NotBlank
    private String shiftEnd;

    private String dutyLocation;
}

