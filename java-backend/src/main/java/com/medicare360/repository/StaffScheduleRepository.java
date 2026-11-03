package com.medicare360.repository;

import com.medicare360.entity.StaffSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffScheduleRepository extends JpaRepository<StaffSchedule, Long> {

    Page<StaffSchedule> findByStaffType(String staffType, Pageable pageable);

    List<StaffSchedule> findByDayOfWeek(String dayOfWeek);
}
