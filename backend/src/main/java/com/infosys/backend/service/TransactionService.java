package com.infosys.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.backend.entity.Transactions;
import com.infosys.backend.repository.TransactionRepository;

@Service
public class TransactionService {
   @Autowired
   TransactionRepository transRepo;
	public Transactions creatingTransaction(Transactions data) {
		// TODO Auto-generated method stub
		return transRepo.save(data);
	}

}
