package com.taptrack.security;

import com.taptrack.entity.Account;
import com.taptrack.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Account a = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Account not found: " + email));
        return new UserPrincipal(a);
    }
}