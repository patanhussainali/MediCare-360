package com.medicare360.repository;

import com.medicare360.entity.Receptionist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReceptionistRepository extends JpaRepository<Receptionist, Long> {

    Optional<Receptionist> findFirstByUserIdOrderByIdDesc(Long userId);

    default Optional<Receptionist> findByUserId(Long userId) {
        return findFirstByUserIdOrderByIdDesc(userId);
    }

    Optional<Receptionist> findByReceptionistId(String receptionistId);

    boolean existsByEmail(String email);
}
