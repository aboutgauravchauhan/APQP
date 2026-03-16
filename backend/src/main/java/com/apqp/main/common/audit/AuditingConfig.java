package com.apqp.main.common.audit;

import com.apqp.main.auth.security.UserPrincipal;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@Configuration
public class AuditingConfig {

    @Bean
    public AuditorAware<Long> auditorAware() {
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserPrincipal)) {
                return Optional.empty();
            }
            return Optional.of(((UserPrincipal) auth.getPrincipal()).getId());
        };
    }
}
