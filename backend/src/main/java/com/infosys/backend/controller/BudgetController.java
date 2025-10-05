package com.infosys.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.backend.dto.BudgetRequestDTO;
import com.infosys.backend.entity.Budget;
import com.infosys.backend.entity.Users;
import com.infosys.backend.repository.UserRepository;
import com.infosys.backend.service.BudgetService;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {
	@Autowired
	BudgetService budser;
	@Autowired
	UserRepository userRepo;

	@PostMapping
	public Budget createBudget(@RequestBody BudgetRequestDTO data) {
		Users user = userRepo.findById(data.getUser_id()).orElseThrow(() -> new RuntimeException("User not found"));

		Budget bud = new Budget();
		bud.setUser_id(user); // FK mapping
		bud.setCategory(data.getCategory());
		bud.setAmount(data.getAmount());
		bud.setStartDate(data.getStartDate());
		bud.setEndDate(data.getEndDate());

		return budser.creatingBudget(bud);
	}

}
