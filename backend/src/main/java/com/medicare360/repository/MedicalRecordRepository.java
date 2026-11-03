package com.medicare360.repository;

import com.medicare360.entity.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends MongoRepository<MedicalRecord, String> {

    Page<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(String patientId, Pageable pageable);

    @Query("{ $or: [ { diagnosis: { $regex: '^Lab Referral:', $options: 'i' } }, { examination_notes: { $regex: 'lab_referral', $options: 'i' } } ] }")
    Page<MedicalRecord> findLabReferrals(Pageable pageable);

    Optional<MedicalRecord> findByRecordNumber(String recordNumber);
}
