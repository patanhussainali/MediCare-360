package com.medicare360.repository;

import com.medicare360.entity.Nurse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NurseRepository extends JpaRepository<Nurse, Long> {

    Optional<Nurse> findFirstByUserIdOrderByIdDesc(Long userId);

    default Optional<Nurse> findByUserId(Long userId) {
        return findFirstByUserIdOrderByIdDesc(userId);
    }

    Optional<Nurse> findByNurseId(String nurseId);

    boolean existsByEmail(String email);
}
