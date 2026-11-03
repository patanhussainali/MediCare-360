package com.medicare360.repository;

import com.medicare360.entity.MedicineIssueRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicineIssueRecordRepository extends JpaRepository<MedicineIssueRecord, Long> {

    Page<MedicineIssueRecord> findAll(Pageable pageable);

    long count();
}
