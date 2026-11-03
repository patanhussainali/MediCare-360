package com.medicare360.repository;

import com.medicare360.entity.Nurse;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NurseRepository extends MongoRepository<Nurse, String> {

    Optional<Nurse> findFirstByUserIdOrderByIdDesc(String userId);

    default Optional<Nurse> findByUserId(String userId) {
        return findFirstByUserIdOrderByIdDesc(userId);
    }

    Optional<Nurse> findByNurseId(String nurseId);

    boolean existsByEmail(String email);
}
