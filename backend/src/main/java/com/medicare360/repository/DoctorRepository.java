package com.medicare360.repository;

import com.medicare360.entity.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends MongoRepository<Doctor, String> {

    Optional<Doctor> findByDoctorId(String doctorId);

    Optional<Doctor> findFirstByUserIdOrderByIdDesc(String userId);

    default Optional<Doctor> findByUserId(String userId) {
        return findFirstByUserIdOrderByIdDesc(userId);
    }

    List<Doctor> findByDepartmentId(String departmentId);

    List<Doctor> findByStatus(String status);
}
