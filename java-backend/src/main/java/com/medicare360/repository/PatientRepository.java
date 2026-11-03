package com.medicare360.repository;

import com.medicare360.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long>, JpaSpecificationExecutor<Patient> {

    Optional<Patient> findByPatientId(String patientId);

    Optional<Patient> findByEmailIgnoreCase(String email);

    Optional<Patient> findFirstByUserIdOrderByIdDesc(Long userId);

    default Optional<Patient> findByUserId(Long userId) {
        return findFirstByUserIdOrderByIdDesc(userId);
    }

    boolean existsByEmail(String email);

    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.patientId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Patient> searchPatients(@Param("search") String search, Pageable pageable);
}
