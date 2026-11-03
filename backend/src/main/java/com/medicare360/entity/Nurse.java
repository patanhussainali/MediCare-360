package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "nurses")
@Getter
@Setter
@NoArgsConstructor
public class Nurse extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nurse_id", unique = true, length = 50)
    private String nurseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "full_name", length = 255)
    private String fullName;

    @Column(name = "license_number", length = 100)
    private String licenseNumber;

    @Column(length = 50)
    private String shift = "Morning";

    @Column(length = 50)
    private String phone;

    @Column(unique = true, length = 255)
    private String email;

    @Column(length = 50)
    private String status = "Active";
}
