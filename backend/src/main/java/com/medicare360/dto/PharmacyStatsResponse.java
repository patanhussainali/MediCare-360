package com.medicare360.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyStatsResponse {

    private long totalMedicines;

    private long lowStockCount;

    private long outOfStockCount;

    private long totalDispensed;
}

