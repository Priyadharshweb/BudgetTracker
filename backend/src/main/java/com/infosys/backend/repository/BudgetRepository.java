package com.infosys.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.backend.entity.Budget;
import com.infosys.backend.entity.Users;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long>{
	List<Budget> findByUser(Users user);

	

}
