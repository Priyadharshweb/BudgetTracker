package com.infosys.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.infosys.backend.entity.Users;
import com.infosys.backend.entity.Budget;
import com.infosys.backend.entity.Savings;
import com.infosys.backend.entity.Transactions;
import com.infosys.backend.repository.UserRepository;
import com.infosys.backend.repository.TransactionRepository;
import com.infosys.backend.repository.BudgetRepository;
import com.infosys.backend.repository.SavingsRepository;

import java.util.List;
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    

    @GetMapping("/users")
    public ResponseEntity<List<Users>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transactions>> getAllTransactions() {
        return ResponseEntity.ok(transactionRepository.findAll());
    }
    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        // Delete transaction logic
        return ResponseEntity.ok().build();
    }


//    @GetMapping("/budgets")
//    public ResponseEntity<List<Budget>> getAllBudgets() {
//        return ResponseEntity.ok(budgetRepository.findAll());
//    }
//
//    @GetMapping("/savings")
//    public ResponseEntity<List<Savings>> getAllSavings() {
//        return ResponseEntity.ok(savingsRepository.findAll());
//    }
}
