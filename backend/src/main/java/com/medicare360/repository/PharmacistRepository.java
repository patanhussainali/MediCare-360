package com.medicare360.repository;

import com.medicare360.entity.Pharmacist;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PharmacistRepository extends MongoRepository<Pharmacist, String> {

    Optional<Pharmacist> findFirstByUserIdOrderByIdDesc(String userId);

    default Optional<Pharmacist> findByUserId(String userId) {
        return findFirstByUserIdOrderByIdDesc(userId);
    }

    Optional<Pharmacist> findByPharmacistId(String pharmacistId);

    boolean existsByEmail(String email);
}
