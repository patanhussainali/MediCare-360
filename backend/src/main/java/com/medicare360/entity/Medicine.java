package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "medicines")
@Getter
@Setter
@NoArgsConstructor
public class Medicine extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    private String code;

    @Indexed(unique = true)
    private String name;

    @Field("generic_name")
    private String genericName;

    private String category;

    private String manufacturer;

    @Field("unit_price")
    private double unitPrice = 0.0;

    @Field("stock_quantity")
    private int stockQuantity = 0;

    @Field("min_stock_threshold")
    private int minStockThreshold = 10;

    @Field("expiry_date")
    private String expiryDate;

    private String status = "Available";
}
