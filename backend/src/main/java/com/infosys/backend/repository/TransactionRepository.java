package com.infosys.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.backend.entity.Transactions;

@Repository
public interface TransactionRepository extends JpaRepository<Transactions,Long>{

}
