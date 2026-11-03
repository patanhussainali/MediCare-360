package com.medicare360.repository;

import com.medicare360.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends MongoRepository<Patient, String> {

    Optional<Patient> findByPatientId(String patientId);

    Optional<Patient> findByEmailIgnoreCase(String email);

    Optional<Patient> findFirstByUserIdOrderByIdDesc(String userId);

    default Optional<Patient> findByUserId(String userId) {
        return findFirstByUserIdOrderByIdDesc(userId);
    }

    boolean existsByEmail(String email);

    @Query("{ $or: [ { full_name: { $regex: ?0, $options: 'i' } }, { patient_id: { $regex: ?0, $options: 'i' } }, { phone: { $regex: ?0, $options: 'i' } }, { email: { $regex: ?0, $options: 'i' } } ] }")
    Page<Patient> searchPatients(String search, Pageable pageable);
}
