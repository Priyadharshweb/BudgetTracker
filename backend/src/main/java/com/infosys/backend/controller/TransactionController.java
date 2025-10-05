package com.infosys.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.infosys.backend.dto.TransactionRequestDTO;
import com.infosys.backend.entity.Transactions;
import com.infosys.backend.entity.Users;
import com.infosys.backend.repository.UserRepository;
import com.infosys.backend.service.TransactionService;

@RestController
@RequestMapping("/api/transaction")
public class TransactionController {
	@Autowired
    TransactionService transSer;
	@Autowired
	UserRepository userRepo;
	@PostMapping
	public Transactions createTransaction(@RequestBody TransactionRequestDTO dto) {
        Users user = userRepo.findById(dto.getUser_id())
                             .orElseThrow(() -> new RuntimeException("User not found"));

        Transactions transaction = new Transactions();
        transaction.setUser_id(user); // Mapping user FK
        transaction.setType(dto.getType());
        transaction.setAmount(dto.getAmount());
        transaction.setCategory(dto.getCategory());
        transaction.setDescription(dto.getDescription());
        transaction.setDate(dto.getDate());

        return transSer.creatingTransaction(transaction);
    }

}
