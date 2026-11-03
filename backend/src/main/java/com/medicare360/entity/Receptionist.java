package com.medicare360.entity;

import com.medicare360.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "receptionists")
@Getter
@Setter
@NoArgsConstructor
public class Receptionist extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receptionist_id", unique = true, length = 50)
    private String receptionistId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "full_name", length = 255)
    private String fullName;

    @Column(length = 50)
    private String shift = "Day";

    @Column(length = 50)
    private String phone;

    @Column(unique = true, length = 255)
    private String email;

    @Column(length = 50)
    private String status = "Active";
}
