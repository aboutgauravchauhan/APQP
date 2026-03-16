package com.apqp.main.customer.controller;

import com.apqp.main.common.exception.ResourceNotFoundException;
import com.apqp.main.customer.entity.Customer;
import com.apqp.main.customer.repository.CustomerRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@Tag(name = "Customers", description = "Customer Master Management")
@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerRepository customerRepository;

    @Operation(summary = "Get all customers (paginated)")
    @GetMapping
    public ResponseEntity<Page<Customer>> getAll(Pageable pageable) {
        return ResponseEntity.ok(customerRepository.findAll(pageable));
    }

    @Operation(summary = "Get all active customers (list for dropdowns)")
    @GetMapping("/active")
    public ResponseEntity<List<Customer>> getActive() {
        return ResponseEntity.ok(customerRepository.findByIsActiveTrue());
    }

    @Operation(summary = "Search customers by name or code")
    @GetMapping("/search")
    public ResponseEntity<List<Customer>> search(@RequestParam String q) {
        return ResponseEntity.ok(customerRepository.searchByNameOrCode(q));
    }

    @Operation(summary = "Get customer by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(@PathVariable Long id) {
        return ResponseEntity.ok(customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id)));
    }

    @Operation(summary = "Create a new customer")
    @PostMapping
    public ResponseEntity<Customer> create(@RequestBody Customer customer) {
        if (customer.getCustomerCode() == null || customer.getCustomerCode().isBlank()) {
            customer.setCustomerCode(generateCode(customer.getCustomerName()));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(customerRepository.save(customer));
    }

    @Operation(summary = "Update customer")
    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id, @RequestBody Customer updated) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        customer.setCustomerName(updated.getCustomerName());
        customer.setOemType(updated.getOemType());
        customer.setLocation(updated.getLocation());
        customer.setCountry(updated.getCountry());
        customer.setContactPerson(updated.getContactPerson());
        customer.setContactEmail(updated.getContactEmail());
        customer.setContactPhone(updated.getContactPhone());
        customer.setActive(updated.isActive());
        return ResponseEntity.ok(customerRepository.save(customer));
    }

    @Operation(summary = "Delete customer")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer", id);
        }
        customerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private String generateCode(String name) {
        // Take first letters of each word, max 6 chars, uppercase
        String base = name.trim().toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9 ]", "")
                .replaceAll("\\s+", "-");
        if (base.length() > 10) base = base.substring(0, 10);
        long count = customerRepository.countByCodeStartsWith(base);
        return count == 0 ? base : base + "-" + (count + 1);
    }
}
