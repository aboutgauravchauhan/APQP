package com.apqp.main.auth.security;

import com.apqp.main.auth.entity.User;
import com.apqp.main.auth.repository.RoleRepository;
import com.apqp.main.auth.repository.UserRepository;
import com.apqp.main.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return buildPrincipal(user);
    }

    @Transactional(readOnly = true)
    public UserPrincipal loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return buildPrincipal(user);
    }

    private UserPrincipal buildPrincipal(User user) {
        String roleCode = roleRepository.findById(user.getRoleId())
                .map(r -> r.getRoleCode())
                .orElse("VIEWER");
        return new UserPrincipal(user, roleCode);
    }
}
