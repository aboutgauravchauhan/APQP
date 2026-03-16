package com.apqp.main.auth.security;

import com.apqp.main.auth.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String employeeCode;
    private final String email;
    private final String password;
    private final Long roleId;
    private final Long plantId;
    private final Long departmentId;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(User user, String roleCode) {
        this.id = user.getId();
        this.employeeCode = user.getEmployeeCode();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.roleId = user.getRoleId();
        this.plantId = user.getPlantId();
        this.departmentId = user.getDepartmentId();
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleCode));
    }

    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
