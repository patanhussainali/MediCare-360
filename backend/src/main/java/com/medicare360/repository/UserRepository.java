package com.medicare360.repository;

import com.medicare360.entity.User;
import com.medicare360.entity.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmail(String email);

    boolean existsByUserCode(String userCode);

    Optional<User> findByUserCodeIgnoreCase(String userCode);

    List<User> findByRole(UserRole role);

    Page<User> findAll(Pageable pageable);
}
