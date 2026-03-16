package com.apqp.main.contact.controller;

import com.apqp.main.common.exception.ResourceNotFoundException;
import com.apqp.main.contact.entity.Contact;
import com.apqp.main.contact.repository.ContactRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Contacts", description = "Contact Master Management")
@RestController
@RequestMapping("/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactRepository contactRepository;

    @Operation(summary = "Get contacts, optionally filtered by customerId or vendorId")
    @GetMapping
    public ResponseEntity<List<Contact>> getAll(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long vendorId) {
        if (customerId != null) {
            return ResponseEntity.ok(contactRepository.findByCustomerId(customerId));
        }
        if (vendorId != null) {
            return ResponseEntity.ok(contactRepository.findByVendorId(vendorId));
        }
        return ResponseEntity.ok(contactRepository.findAll());
    }

    @Operation(summary = "Get contact by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Contact> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", id)));
    }

    @Operation(summary = "Create a contact")
    @PostMapping
    public ResponseEntity<Contact> create(@RequestBody Contact contact) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contactRepository.save(contact));
    }

    @Operation(summary = "Update a contact")
    @PutMapping("/{id}")
    public ResponseEntity<Contact> update(@PathVariable Long id, @RequestBody Contact updated) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", id));
        contact.setFirstName(updated.getFirstName());
        contact.setLastName(updated.getLastName());
        contact.setEmail(updated.getEmail());
        contact.setPhone(updated.getPhone());
        contact.setJobTitle(updated.getJobTitle());
        contact.setDepartment(updated.getDepartment());
        contact.setPrimary(updated.isPrimary());
        contact.setActive(updated.isActive());
        return ResponseEntity.ok(contactRepository.save(contact));
    }

    @Operation(summary = "Delete a contact")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!contactRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contact", id);
        }
        contactRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
