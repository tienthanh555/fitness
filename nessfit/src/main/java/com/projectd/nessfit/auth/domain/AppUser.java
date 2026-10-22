package com.projectd.nessfit.auth.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import com.projectd.nessfit.common.persistence.BaseEntity;

@Entity
@Table(name = "users")
public class AppUser extends BaseEntity {

    @Column(nullable = false, unique = true, length = 254)
    private String email;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 100)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccountStatus status;

    @Column(nullable = false)
    private int failedLoginAttempts;

    private Instant lockedAt;

    private Instant deletedAt;

    protected AppUser() {
    }

    public AppUser(String email, String fullName, String passwordHash, Role role) {
        this.email = email;
        this.fullName = fullName;
        this.passwordHash = passwordHash;
        this.role = role;
        this.status = AccountStatus.ACTIVE;
        this.failedLoginAttempts = 0;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public AccountStatus getStatus() {
        return status;
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public Instant getLockedAt() {
        return lockedAt;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public void updateProfile(String fullName, String email) {
        this.fullName = fullName;
        this.email = email;
    }

    public void updatePassword(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void registerFailedLogin(int maximumAttempts) {
        failedLoginAttempts++;
        if (failedLoginAttempts >= maximumAttempts) {
            status = AccountStatus.LOCKED;
            lockedAt = Instant.now();
        }
    }

    public void resetFailedLoginAttempts() {
        failedLoginAttempts = 0;
    }

    public void lock() {
        status = AccountStatus.LOCKED;
        lockedAt = Instant.now();
    }

    public void unlock() {
        status = AccountStatus.ACTIVE;
        lockedAt = null;
        failedLoginAttempts = 0;
    }

    public void delete() {
        status = AccountStatus.DELETED;
        deletedAt = Instant.now();
        failedLoginAttempts = 0;
    }
}
