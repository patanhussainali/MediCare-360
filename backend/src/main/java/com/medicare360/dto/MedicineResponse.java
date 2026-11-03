package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class MedicineResponse {

    private Long id;

    private String code;

    private String name;

    private String genericName;

    private String category;

    private String manufacturer;

    private double unitPrice;

    private int stockQuantity;

    private int minStockThreshold;

    private String expiryDate;

    private String status;

    private Instant createdAt;

    private Instant updatedAt;
}
