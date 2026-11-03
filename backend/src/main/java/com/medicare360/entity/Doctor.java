package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
public class Doctor extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id", unique = true, length = 50)
    private String doctorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "full_name", length = 255)
    private String fullName;

    @Column(length = 255)
    private String specialization;

    @Column(length = 255)
    private String qualification;

    @Column(name = "experience_years")
    private int experienceYears = 0;

    @Column(name = "consultation_fee")
    private double consultationFee = 50.0;

    @Column(name = "available_days", length = 255)
    private String availableDays;

    @Column(length = 50)
    private String phone;

    @Column(unique = true, length = 255)
    private String email;

    @Column(length = 50)
    private String status = "Available";
}
