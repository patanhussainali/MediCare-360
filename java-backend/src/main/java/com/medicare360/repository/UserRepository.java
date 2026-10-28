package com.medicare360.repository;

import com.medicare360.entity.User;
import com.medicare360.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    List<User> findByRole(UserRole role);

    boolean existsByEmail(String email);
}
