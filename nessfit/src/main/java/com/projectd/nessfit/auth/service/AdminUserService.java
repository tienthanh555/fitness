package com.projectd.nessfit.auth.service;

import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projectd.nessfit.auth.domain.AccountStatus;
import com.projectd.nessfit.auth.domain.AppUser;
import com.projectd.nessfit.auth.domain.Role;
import com.projectd.nessfit.auth.dto.PageResponse;
import com.projectd.nessfit.auth.dto.UserResponse;
import com.projectd.nessfit.auth.repository.UserRepository;
import com.projectd.nessfit.common.exception.ForbiddenOperationException;
import com.projectd.nessfit.common.exception.ResourceNotFoundException;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final AuthService authService;

    public AdminUserService(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> findUsers(String query, AccountStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String normalizedQuery = query == null || query.isBlank() ? "" : query.trim();
        return PageResponse.from(userRepository.search(normalizedQuery, status, pageable).map(UserResponse::from));
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(UUID userId) {
        return UserResponse.from(findUser(userId));
    }

    @Transactional
    public UserResponse lock(UUID actorId, UUID targetId) {
        AppUser target = findManageableUser(actorId, targetId);
        target.lock();
        userRepository.save(target);
        authService.revokeAllRefreshTokens(targetId);
        return UserResponse.from(target);
    }

    @Transactional
    public UserResponse unlock(UUID actorId, UUID targetId) {
        AppUser target = findManageableUser(actorId, targetId);
        target.unlock();
        userRepository.save(target);
        return UserResponse.from(target);
    }

    @Transactional
    public void delete(UUID actorId, UUID targetId) {
        AppUser target = findManageableUser(actorId, targetId);
        target.delete();
        userRepository.save(target);
        authService.revokeAllRefreshTokens(targetId);
    }

    private AppUser findManageableUser(UUID actorId, UUID targetId) {
        if (actorId.equals(targetId)) {
            throw new ForbiddenOperationException("An administrator cannot manage their own account from this endpoint");
        }
        AppUser target = findUser(targetId);
        if (target.getRole() == Role.ADMIN) {
            throw new ForbiddenOperationException("Administrator accounts cannot be managed from this endpoint");
        }
        return target;
    }

    private AppUser findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
