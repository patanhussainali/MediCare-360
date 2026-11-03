package com.medicare360.repository;

import com.medicare360.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long>, JpaSpecificationExecutor<Doctor> {

    Optional<Doctor> findByDoctorId(String doctorId);

    Optional<Doctor> findFirstByUserIdOrderByIdDesc(Long userId);

    default Optional<Doctor> findByUserId(Long userId) {
        return findFirstByUserIdOrderByIdDesc(userId);
    }

    List<Doctor> findByDepartmentId(Long departmentId);

    List<Doctor> findByStatus(String status);
}
