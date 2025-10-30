package com.infosys.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.backend.entity.Transactions;
import com.infosys.backend.entity.Users;

@Repository
public interface TransactionRepository extends JpaRepository<Transactions,Long>{
	 List<Transactions> findByUser(Users user);


}
