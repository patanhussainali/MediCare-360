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
public class BillingStatsResponse {

    private double totalInvoiced;

    private double totalPaid;

    private double totalPending;

    private Map<String, Long> byStatus;

    private long invoiceCount;
}

