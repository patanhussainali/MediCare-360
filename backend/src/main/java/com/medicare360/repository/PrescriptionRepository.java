package com.medicare360.repository;

import com.medicare360.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrescriptionRepository extends MongoRepository<Prescription, String> {

    Page<Prescription> findByPatientId(String patientId, Pageable pageable);

    Page<Prescription> findByDoctorId(String doctorId, Pageable pageable);

    Optional<Prescription> findByPrescriptionNumber(String prescriptionNumber);
}
