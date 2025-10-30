package com.infosys.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.infosys.backend.dto.BudgetRequestDTO;
import com.infosys.backend.entity.Budget;
import com.infosys.backend.entity.Users;
import com.infosys.backend.repository.BudgetRepository;
import com.infosys.backend.repository.UserRepository;
import com.infosys.backend.service.BudgetService;

@RestController
@CrossOrigin(origins = "http://localhost:5173/")
@RequestMapping("/api/budget")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    // ✅ Get all budgets for the logged-in user
    @GetMapping
    public ResponseEntity<List<Budget>> getBudgets(Authentication authentication) {
        String userEmail = authentication.getName();
        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Budget> budgets = budgetRepository.findByUser(user);
        return ResponseEntity.ok(budgets);
    }

    // ✅ Create a new budget for the logged-in user
    @PostMapping
    public ResponseEntity<Budget> createBudget(@RequestBody BudgetRequestDTO data, Authentication authentication) {
        String userEmail = authentication.getName();
        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Budget budget = new Budget();
        budget.setUser(user);
        budget.setCategory(data.getCategory());
        budget.setAmount(data.getAmount());
        budget.setStartDate(data.getStartDate());
        budget.setEndDate(data.getEndDate());

        Budget savedBudget = budgetService.creatingBudget(budget);
        return ResponseEntity.ok(savedBudget);
    }

    // ✅ Update budget (only if it belongs to the logged-in user)
    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id,
                                               @RequestBody BudgetRequestDTO data,
                                               Authentication authentication) {
        String userEmail = authentication.getName();
        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Budget existingBudget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!existingBudget.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        existingBudget.setCategory(data.getCategory());
        existingBudget.setAmount(data.getAmount());
        existingBudget.setStartDate(data.getStartDate());
        existingBudget.setEndDate(data.getEndDate());

        Budget updatedBudget = budgetRepository.save(existingBudget);
        return ResponseEntity.ok(updatedBudget);
    }

    // ✅ Delete budget (only if it belongs to the logged-in user)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id, Authentication authentication) {
        String userEmail = authentication.getName();
        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        budgetRepository.delete(budget);
        return ResponseEntity.ok().build();
    }
}
