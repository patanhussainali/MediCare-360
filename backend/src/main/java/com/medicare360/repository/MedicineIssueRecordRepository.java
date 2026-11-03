package com.medicare360.repository;

import com.medicare360.entity.MedicineIssueRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicineIssueRecordRepository extends MongoRepository<MedicineIssueRecord, String> {

    Page<MedicineIssueRecord> findAll(Pageable pageable);
}
