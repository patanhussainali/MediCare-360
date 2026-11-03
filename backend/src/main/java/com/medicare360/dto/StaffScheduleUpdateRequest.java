package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class StaffScheduleUpdateRequest {

    private String dayOfWeek;

    private String shiftStart;

    private String shiftEnd;

    private String dutyLocation;
}

