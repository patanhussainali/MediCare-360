package com.medicare360.entity;

public enum PaymentStatus {
    PENDING("Pending"),
    PAID("Paid"),
    PARTIAL("Partial"),
    CANCELLED("Cancelled"),
    REFUNDED("Refunded");

    private final String dbValue;

    PaymentStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static PaymentStatus fromDbValue(String dbValue) {
        if (dbValue == null) return null;
        for (PaymentStatus s : values()) {
            if (s.dbValue.equals(dbValue)) return s;
        }
        throw new IllegalArgumentException("Unknown PaymentStatus db value: " + dbValue);
    }
}
