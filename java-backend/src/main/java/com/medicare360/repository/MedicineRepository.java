package com.medicare360.repository;

import com.medicare360.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long>, JpaSpecificationExecutor<Medicine> {

    Optional<Medicine> findByCode(String code);

    Optional<Medicine> findByName(String name);

    List<Medicine> findByStockQuantityLessThanEqual(int threshold);

    List<Medicine> findByStockQuantityEquals(int quantity);
}
