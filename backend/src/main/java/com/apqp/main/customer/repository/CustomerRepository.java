package com.apqp.main.customer.repository;

import com.apqp.main.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByCustomerCode(String customerCode);

    boolean existsByCustomerCode(String customerCode);

    List<Customer> findByIsActiveTrue();

    @Query("""
        SELECT c FROM Customer c
        WHERE LOWER(c.customerName) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :search, '%'))
        """)
    List<Customer> searchByNameOrCode(@Param("search") String search);

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.customerCode LIKE CONCAT(:prefix, '%')")
    long countByCodeStartsWith(@Param("prefix") String prefix);
}
