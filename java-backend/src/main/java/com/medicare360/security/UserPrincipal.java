package com.medicare360.security;

import com.medicare360.entity.User;
import com.medicare360.entity.UserRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private final Long userId;
    private final String email;
    private final String role;
    private final boolean isActive;
    private final String hashedPassword;

    public UserPrincipal(Long userId, String email, String role, boolean isActive, String hashedPassword) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.isActive = isActive;
        this.hashedPassword = hashedPassword;
    }

    /** Convenience constructor for filter (no password needed). */
    public UserPrincipal(Long userId, String email, UserRole role, boolean isActive) {
        this(userId, email, role != null ? role.name() : null, isActive, null);
    }

    /** Static factory from User entity. */
    public static UserPrincipal from(User user) {
        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : null,
                user.isActive(),
                user.getHashedPassword()
        );
    }

    public Long getUserId() {
        return userId;
    }

    public String getRole() {
        return role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() {
        return hashedPassword;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }
}
