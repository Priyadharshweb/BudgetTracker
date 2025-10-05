package com.infosys.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.backend.dto.SavingsRequestDTO;
import com.infosys.backend.entity.Savings;
import com.infosys.backend.entity.Users;
import com.infosys.backend.repository.UserRepository;
import com.infosys.backend.service.SavingsService;

@RestController
@RequestMapping("/api/savings")
public class SavingsController {
	@Autowired
    private SavingsService savingsService;

    @Autowired
    private UserRepository userRepo;

    @PostMapping
    public Savings createSavings(@RequestBody SavingsRequestDTO dto) {
        Users user = userRepo.findById(dto.getUser_id())
                             .orElseThrow(() -> new RuntimeException("User not found"));

        Savings savings = new Savings();
        savings.setUser_id(user);
        savings.setGoal_name(dto.getGoal_name());
        savings.setTarget_amt(dto.getTarget_amt());
        savings.setCurr_amt(dto.getCurr_amt());
        savings.setDeadline(dto.getDeadline());

        return savingsService.createSavings(savings);
    }

}
