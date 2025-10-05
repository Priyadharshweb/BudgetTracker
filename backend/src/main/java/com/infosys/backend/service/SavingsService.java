package com.infosys.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.backend.entity.Savings;
import com.infosys.backend.repository.SavingsRepository;

@Service
public class SavingsService {
	@Autowired
    private SavingsRepository savingsRepo;

    public Savings createSavings(Savings savings) {
        return savingsRepo.save(savings);
    }

}
