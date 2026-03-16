package com.apqp.main.vendor.repository;

import com.apqp.main.vendor.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, Long>, JpaSpecificationExecutor<Vendor> {
    Optional<Vendor> findByVendorCode(String vendorCode);
    boolean existsByVendorCode(String vendorCode);
    List<Vendor> findByApprovalStatus(Vendor.ApprovalStatus approvalStatus);
    List<Vendor> findByStatus(Vendor.VendorStatus status);
}
