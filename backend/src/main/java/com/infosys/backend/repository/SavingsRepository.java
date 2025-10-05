package com.infosys.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.backend.entity.Savings;

@Repository
public interface SavingsRepository extends JpaRepository<Savings, Long>{

}
