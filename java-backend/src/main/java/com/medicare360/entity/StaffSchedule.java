package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "staff_schedules")
@Getter
@Setter
@NoArgsConstructor
public class StaffSchedule extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "staff_type", length = 50)
    private String staffType;

    @Column(name = "staff_id")
    private int staffId;

    @Column(name = "staff_name", length = 255)
    private String staffName;

    @Column(name = "day_of_week", length = 20)
    private String dayOfWeek;

    @Column(name = "shift_start", length = 20)
    private String shiftStart;

    @Column(name = "shift_end", length = 20)
    private String shiftEnd;

    @Column(name = "duty_location", length = 100)
    private String dutyLocation;
}
