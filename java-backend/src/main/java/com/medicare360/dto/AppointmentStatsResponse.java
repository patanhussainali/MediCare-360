package com.medicare360.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentStatsResponse {

    private long totalAppointments;

    private Map<String, Long> byStatus;

    private long todayCount;

    private long upcomingCount;
}

