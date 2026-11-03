package com.medicare360.repository;

import com.medicare360.entity.Pharmacist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PharmacistRepository extends JpaRepository<Pharmacist, Long> {

    Optional<Pharmacist> findFirstByUserIdOrderByIdDesc(Long userId);

    default Optional<Pharmacist> findByUserId(Long userId) {
        return findFirstByUserIdOrderByIdDesc(userId);
    }

    Optional<Pharmacist> findByPharmacistId(String pharmacistId);

    boolean existsByEmail(String email);
}
