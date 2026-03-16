package com.apqp.main.contact.repository;

import com.apqp.main.contact.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactRepository extends JpaRepository<Contact, Long> {

    List<Contact> findByCustomerId(Long customerId);

    List<Contact> findByVendorId(Long vendorId);

    List<Contact> findByCustomerIdAndIsActiveTrue(Long customerId);

    List<Contact> findByVendorIdAndIsActiveTrue(Long vendorId);
}
