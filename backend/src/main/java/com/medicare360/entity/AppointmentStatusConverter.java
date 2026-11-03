package com.medicare360.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class AppointmentStatusConverter implements AttributeConverter<AppointmentStatus, String> {

    @Override
    public String convertToDatabaseColumn(AppointmentStatus status) {
        return status == null ? null : status.getDbValue();
    }

    @Override
    public AppointmentStatus convertToEntityAttribute(String dbData) {
        return AppointmentStatus.fromDbValue(dbData);
    }
}
