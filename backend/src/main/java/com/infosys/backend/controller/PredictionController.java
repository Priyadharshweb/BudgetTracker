package com.infosys.backend.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.infosys.backend.service.ExpensePredictionService;

@RestController
@RequestMapping("/api/predict")
@CrossOrigin(origins = "*")
public class PredictionController {

    @Autowired
    private ExpensePredictionService predictionService;

    @GetMapping("/{userId}")
    public String getExpensePrediction(@PathVariable Long userId) {
        double nextMonthExpense = predictionService.predictNextMonthExpenses(userId);
        return "Predicted next month's expense for user " + userId + " is ₹" + String.format("%.2f", nextMonthExpense);
    }
}