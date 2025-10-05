package com.infosys.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.backend.entity.Budget;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long>{

	

}
