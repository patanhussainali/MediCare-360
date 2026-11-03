package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "staff_schedules")
@Getter
@Setter
@NoArgsConstructor
public class StaffSchedule extends BaseEntity {

    @Id
    private String id;

    @Field("staff_type")
    private String staffType;

    @Field("staff_id")
    private String staffId;

    @Field("staff_name")
    private String staffName;

    @Field("day_of_week")
    private String dayOfWeek;

    @Field("shift_start")
    private String shiftStart;

    @Field("shift_end")
    private String shiftEnd;

    @Field("duty_location")
    private String dutyLocation;
}
