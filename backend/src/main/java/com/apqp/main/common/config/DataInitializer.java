package com.apqp.main.common.config;

import com.apqp.main.auth.entity.User;
import com.apqp.main.auth.repository.UserRepository;
import com.apqp.main.customer.entity.Customer;
import com.apqp.main.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbc;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedPlantAndDepartment();
        seedAdminUser();
        seedSampleCustomers();
    }

    private void seedPlantAndDepartment() {
        Long plantCount = jdbc.queryForObject("SELECT COUNT(*) FROM plants", Long.class);
        if (plantCount == null || plantCount == 0) {
            jdbc.execute("""
                INSERT INTO plants (plant_code, plant_name, location, is_active)
                VALUES ('PLT-01', 'Main Plant', 'India', true)
                """);
            log.info("Seeded default plant");
        }

        Long deptCount = jdbc.queryForObject("SELECT COUNT(*) FROM departments", Long.class);
        if (deptCount == null || deptCount == 0) {
            jdbc.execute("""
                INSERT INTO departments (department_code, department_name, plant_id, is_active)
                VALUES ('DEPT-MGMT', 'Management', 1, true)
                """);
            log.info("Seeded default department");
        }
    }

    private void seedAdminUser() {
        if (userRepository.existsByEmail("admin@apqp.local")) return;

        // Get SUPER_ADMIN role ID
        Long roleId = jdbc.queryForObject(
            "SELECT id FROM roles WHERE role_code = 'SUPER_ADMIN' LIMIT 1", Long.class);

        User admin = User.builder()
                .employeeCode("EMP-001")
                .fullName("System Administrator")
                .email("admin@apqp.local")
                .passwordHash(passwordEncoder.encode("Admin@1234"))
                .designation("System Admin")
                .plantId(1L)
                .departmentId(1L)
                .roleId(roleId != null ? roleId : 1L)
                .status(User.UserStatus.ACTIVE)
                .build();

        userRepository.save(admin);
        log.info("Seeded admin user: admin@apqp.local / Admin@1234");
    }

    private void seedSampleCustomers() {
        if (customerRepository.count() > 0) return;

        customerRepository.save(Customer.builder()
                .customerCode("HONDA")
                .customerName("Honda Motorcycles & Scooters India")
                .oemType("OEM")
                .country("India")
                .location("Manesar, Haryana")
                .contactPerson("Rajesh Kumar")
                .contactEmail("supply@honda.co.in")
                .isActive(true)
                .build());

        customerRepository.save(Customer.builder()
                .customerCode("MARUTI")
                .customerName("Maruti Suzuki India Limited")
                .oemType("OEM")
                .country("India")
                .location("Gurugram, Haryana")
                .contactPerson("Priya Sharma")
                .contactEmail("vendor@marutisuzuki.com")
                .isActive(true)
                .build());

        customerRepository.save(Customer.builder()
                .customerCode("TATA")
                .customerName("Tata Motors Limited")
                .oemType("OEM")
                .country("India")
                .location("Pune, Maharashtra")
                .contactPerson("Amit Verma")
                .contactEmail("sourcing@tatamotors.com")
                .isActive(true)
                .build());

        log.info("Seeded 3 sample customers (Honda, Maruti, Tata)");
    }
}
