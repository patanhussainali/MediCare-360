package com.medicare360.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MedicineStockUpdateRequest {

    @NotNull
    private Integer quantityDelta;

    private String notes;
}

