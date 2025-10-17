package com.infosys.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.infosys.backend.dto.TransactionRequestDTO;
import com.infosys.backend.entity.Transactions;
import com.infosys.backend.entity.Users;
import com.infosys.backend.repository.UserRepository;
import com.infosys.backend.service.TransactionService;

@RestController
@CrossOrigin(origins = "http://localhost:5173/")
@RequestMapping("/api/transaction")
public class TransactionController {

    @Autowired
    private TransactionService transSer;

    @Autowired
    private UserRepository userRepo;

    
    @GetMapping
    public List<Transactions> getAllTransactions() {
        return transSer.fetchTransactions();
    }

    // 🔹 Get transaction by ID
    @GetMapping("/{id}")
    public Transactions getTransactionById(@PathVariable long id) {
        return transSer.findById(id);
    }

    // 🔹 Create a new transaction
    @PostMapping
    public Transactions createTransaction(@RequestBody TransactionRequestDTO dto) {
        Users user = userRepo.findById(dto.getUser_id())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transactions transaction = new Transactions();
        transaction.setUser_id(user); // Set foreign key
        transaction.setType(dto.getType());
        transaction.setAmount(dto.getAmount());
        transaction.setCategory(dto.getCategory());
        transaction.setDescription(dto.getDescription());
        transaction.setDate(dto.getDate());

        return transSer.creatingTransaction(transaction);
    }

    // 🔹 Update existing transaction
    @PutMapping("/{id}")
    public String updateTransaction(@PathVariable long id, @RequestBody TransactionRequestDTO dto) {
        return transSer.updateTransaction(id, dto);
    }

    // 🔹 Delete transaction by ID
    @DeleteMapping("/{id}")
    public String deleteTransaction(@PathVariable long id) {
        return transSer.deleteTransaction(id);
    }
}
