package com.apqp.main.project.repository;

import com.apqp.main.project.entity.ProgramCustomerRep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgramCustomerRepRepository extends JpaRepository<ProgramCustomerRep, Long> {

    List<ProgramCustomerRep> findByProjectId(Long projectId);

    void deleteByProjectIdAndContactId(Long projectId, Long contactId);
}
