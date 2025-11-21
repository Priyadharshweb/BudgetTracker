package com.infosys.backend.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.infosys.backend.entity.Transactions;
import com.infosys.backend.entity.Users;
import com.infosys.backend.repository.TransactionRepository;
import com.infosys.backend.repository.UserRepository;

@RestController
@CrossOrigin(origins = "http://localhost:5173/")
@RequestMapping("/api/transaction")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    // 🔹 Get all transactions FOR LOGGED-IN USER
    @GetMapping
    public ResponseEntity<List<Transactions>> getTransactions(Authentication authentication) {
        String userEmail = authentication.getName();

        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transactions> transactions = transactionRepository.findByUser(user);
        return ResponseEntity.ok(transactions);
    }

    // 🔹 Create new transaction FOR LOGGED-IN USER
    @PostMapping
    public ResponseEntity<Transactions> createTransaction(
            @RequestBody Transactions transaction,
            Authentication authentication) {

        String userEmail = authentication.getName();

        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        transaction.setUser(user);
        return ResponseEntity.ok(transactionRepository.save(transaction));
    }

    // 🔹 Update transaction (only owner can update)
    @PutMapping("/{id}")
    public ResponseEntity<Transactions> updateTransaction(
            @PathVariable Long id,
            @RequestBody Transactions transaction,
            Authentication authentication) {

        String userEmail = authentication.getName();

        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transactions existing = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!existing.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        transaction.setId(id);
        transaction.setUser(user);
        return ResponseEntity.ok(transactionRepository.save(transaction));
    }

    // 🔹 Delete (only owner can delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id,
            Authentication authentication) {

        String userEmail = authentication.getName();

        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transactions transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        transactionRepository.delete(transaction);
        return ResponseEntity.ok().build();
    }
}
