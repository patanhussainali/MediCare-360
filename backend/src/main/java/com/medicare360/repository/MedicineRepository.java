package com.medicare360.repository;

import com.medicare360.entity.Medicine;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends MongoRepository<Medicine, String> {

    Optional<Medicine> findByCode(String code);

    Optional<Medicine> findByName(String name);

    List<Medicine> findByStockQuantityLessThanEqual(int threshold);

    List<Medicine> findByStockQuantityEquals(int quantity);
}
