package com.medicare360.repository;

import com.medicare360.entity.StaffSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffScheduleRepository extends MongoRepository<StaffSchedule, String> {

    Page<StaffSchedule> findByStaffType(String staffType, Pageable pageable);

    List<StaffSchedule> findByDayOfWeek(String dayOfWeek);
}
