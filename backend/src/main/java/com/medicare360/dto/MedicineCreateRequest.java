package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MedicineCreateRequest {

    private String name;

    private String genericName;

    private String code;

    private String category;

    private String manufacturer;

    private Double unitPrice;

    private Integer stockQuantity;

    private Integer minStockThreshold;

    private String expiryDate;

    private String status;
}
