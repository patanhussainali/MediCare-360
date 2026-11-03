package com.medicare360.repository;

import com.medicare360.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    Page<Prescription> findByPatient_Id(Long patientId, Pageable pageable);

    Page<Prescription> findByDoctor_Id(Long doctorId, Pageable pageable);

    Optional<Prescription> findByPrescriptionNumber(String prescriptionNumber);
}
