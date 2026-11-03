package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "medicines")
@Getter
@Setter
@NoArgsConstructor
public class Medicine extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 50)
    private String code;

    @Column(unique = true, length = 255)
    private String name;

    @Column(name = "generic_name", length = 255)
    private String genericName;

    @Column(length = 100)
    private String category;

    @Column(length = 255)
    private String manufacturer;

    @Column(name = "unit_price")
    private double unitPrice = 0.0;

    @Column(name = "stock_quantity")
    private int stockQuantity = 0;

    @Column(name = "min_stock_threshold")
    private int minStockThreshold = 10;

    @Column(name = "expiry_date", length = 50)
    private String expiryDate;

    @Column(length = 50)
    private String status = "Available";
}
