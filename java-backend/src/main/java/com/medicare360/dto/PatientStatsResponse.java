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
public class PatientStatsResponse {

    private long totalPatients;

    private Map<String, Long> genderDistribution;

    private Map<String, Long> bloodGroupDistribution;

    private long newPatientsLast30Days;
}

