package com.medicare360.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private PatientStatsResponse patients;

    private AppointmentStatsResponse appointments;

    private BillingStatsResponse billing;

    private PharmacyStatsResponse pharmacy;
}

