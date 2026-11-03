package com.medicare360.entity;

public enum AppointmentStatus {
    SCHEDULED("Scheduled"),
    CONFIRMED("Confirmed"),
    IN_PROGRESS("In Progress"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled"),
    NO_SHOW("No-show");

    private final String dbValue;

    AppointmentStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static AppointmentStatus fromDbValue(String dbValue) {
        if (dbValue == null) return null;
        for (AppointmentStatus s : values()) {
            if (s.dbValue.equals(dbValue)) return s;
        }
        throw new IllegalArgumentException("Unknown AppointmentStatus db value: " + dbValue);
    }
}
