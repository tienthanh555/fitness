package com.projectd.nessfit.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.projectd.nessfit.auth.domain.AccountStatus;
import com.projectd.nessfit.auth.domain.AppUser;

public interface UserRepository extends JpaRepository<AppUser, UUID> {

    Optional<AppUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @Query("""
            select u from AppUser u
            where (:query = '' or lower(u.fullName) like lower(concat('%', :query, '%'))
                   or lower(u.email) like lower(concat('%', :query, '%')))
              and (:status is null or u.status = :status)
            """)
    Page<AppUser> search(@Param("query") String query, @Param("status") AccountStatus status, Pageable pageable);
}
