package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class StaffScheduleResponse {

    private String id;

    private String staffType;

    private String staffId;

    private String staffName;

    private String dayOfWeek;

    private String shiftStart;

    private String shiftEnd;

    private String dutyLocation;

    private Instant createdAt;

    private Instant updatedAt;
}

