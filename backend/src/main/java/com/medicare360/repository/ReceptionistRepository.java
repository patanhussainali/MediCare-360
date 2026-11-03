package com.medicare360.repository;

import com.medicare360.entity.Receptionist;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReceptionistRepository extends MongoRepository<Receptionist, String> {

    Optional<Receptionist> findFirstByUserIdOrderByIdDesc(String userId);

    default Optional<Receptionist> findByUserId(String userId) {
        return findFirstByUserIdOrderByIdDesc(userId);
    }

    Optional<Receptionist> findByReceptionistId(String receptionistId);

    boolean existsByEmail(String email);
}
