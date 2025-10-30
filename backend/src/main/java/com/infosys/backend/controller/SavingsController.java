package com.infosys.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.infosys.backend.dto.SavingsRequestDTO;
import com.infosys.backend.entity.Savings;
import com.infosys.backend.entity.Users;
import com.infosys.backend.repository.SavingsRepository;
import com.infosys.backend.repository.UserRepository;
import com.infosys.backend.service.SavingsService;

@RestController
@CrossOrigin(origins = "http://localhost:5173/")
@RequestMapping("/api/savings")
public class SavingsController {

    @Autowired
    private SavingsService savingsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SavingsRepository savingsRepository;

    // ✅ Get all savings goals for the logged-in user
    @GetMapping
    public ResponseEntity<List<Savings>> getAllSavings(Authentication authentication) {
        String userEmail = authentication.getName();
        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Savings> savingsList = savingsRepository.findByUser(user);
        return ResponseEntity.ok(savingsList);
    }

    // ✅ Create a new savings goal for the logged-in user
    @PostMapping
    public ResponseEntity<Savings> createSavings(@RequestBody SavingsRequestDTO dto, Authentication authentication) {
        String userEmail = authentication.getName();
        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Savings savings = new Savings();
        savings.setUser(user);
        savings.setGoal_name(dto.getGoal_name());
        savings.setTarget_amt(dto.getTarget_amt());
        savings.setCurr_amt(dto.getCurr_amt());
        savings.setDeadline(dto.getDeadline());

        Savings savedSavings = savingsService.createSavings(savings);
        return ResponseEntity.ok(savedSavings);
    }

    // ✅ Update savings goal (only if it belongs to the logged-in user)
    @PutMapping("/{id}")
    public ResponseEntity<Savings> updateSavings(@PathVariable Long id,
                                                 @RequestBody SavingsRequestDTO dto,
                                                 Authentication authentication) {
        String userEmail = authentication.getName();
        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Savings existingSavings = savingsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));

        if (!existingSavings.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        existingSavings.setGoal_name(dto.getGoal_name());
        existingSavings.setTarget_amt(dto.getTarget_amt());
        existingSavings.setCurr_amt(dto.getCurr_amt());
        existingSavings.setDeadline(dto.getDeadline());

        Savings updatedSavings = savingsRepository.save(existingSavings);
        return ResponseEntity.ok(updatedSavings);
    }

    // ✅ Delete savings goal (only if it belongs to the logged-in user)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSavings(@PathVariable Long id, Authentication authentication) {
        String userEmail = authentication.getName();
        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Savings savings = savingsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));

        if (!savings.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        savingsRepository.delete(savings);
        return ResponseEntity.ok().build();
    }
}
