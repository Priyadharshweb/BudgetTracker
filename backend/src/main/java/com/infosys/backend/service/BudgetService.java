package com.infosys.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.backend.entity.Budget;
import com.infosys.backend.repository.BudgetRepository;

@Service
public class BudgetService {
   @Autowired
   BudgetRepository budRepo;
	public Budget creatingBudget(Budget data) {
		// TODO Auto-generated method stub
		return budRepo.save(data);
	}

}
