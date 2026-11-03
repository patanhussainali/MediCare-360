package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "medicine_issue_records")
@Getter
@Setter
@NoArgsConstructor
public class MedicineIssueRecord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    private int quantity;

    @Column(name = "dispensed_by", length = 255)
    private String dispensedBy;

    @Column(name = "dispensed_at", columnDefinition = "DATETIME")
    private Instant dispensedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
