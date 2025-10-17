package com.infosys.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.backend.dto.TransactionRequestDTO;
import com.infosys.backend.entity.Transactions;
import com.infosys.backend.entity.Users;
import com.infosys.backend.repository.TransactionRepository;
import com.infosys.backend.repository.UserRepository;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transRepo;

    @Autowired
    private UserRepository userRepo;

    // 🔹 Create new transaction
    public Transactions creatingTransaction(Transactions data) {
        return transRepo.save(data);
    }

    // 🔹 Get all transactions
    public List<Transactions> fetchTransactions() {
        return transRepo.findAll();
    }

    // 🔹 Get transaction by ID
    public Transactions findById(long id) {
        return transRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with ID: " + id));
    }

    // 🔹 Update transaction
    public String updateTransaction(long id, TransactionRequestDTO dto) {
        Optional<Transactions> optionalTrans = transRepo.findById(id);
        if (optionalTrans.isPresent()) {
            Transactions transaction = optionalTrans.get();

            Users user = userRepo.findById(dto.getUser_id())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            transaction.setUser_id(user);
            transaction.setType(dto.getType());
            transaction.setAmount(dto.getAmount());
            transaction.setCategory(dto.getCategory());
            transaction.setDescription(dto.getDescription());
            transaction.setDate(dto.getDate());

            transRepo.save(transaction);
            return "Transaction updated successfully!";
        } else {
            return "Transaction not found!";
        }
    }

    // 🔹 Delete transaction
    public String deleteTransaction(long id) {
        if (transRepo.existsById(id)) {
            transRepo.deleteById(id);
            return "Transaction deleted successfully!";
        } else {
            return "Transaction not found!";
        }
    }
}
