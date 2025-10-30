package com.infosys.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.backend.entity.Savings;
import com.infosys.backend.entity.Users;

@Repository
public interface SavingsRepository extends JpaRepository<Savings, Long>{
	List<Savings> findByUser(Users user);

}
