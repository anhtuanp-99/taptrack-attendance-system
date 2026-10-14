package com.taptrack.security;

import com.taptrack.entity.Account;
import com.taptrack.enums.Role;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final Role role;

    public UserPrincipal(Account a) {
        this.id = a.getId();
        this.email = a.getEmail();
        this.password = a.getPasswordHash();
        this.role = a.getRole();
    }

    public UserPrincipal(Long id, String email, Role role) {
        this.id = id; this.email = email; this.password = null; this.role = role;
    }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    @Override public String getUsername()              { return email; }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }
}