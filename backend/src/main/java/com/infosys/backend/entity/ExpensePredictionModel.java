package com.infosys.backend.entity;
import java.util.List;

public class ExpensePredictionModel {

    public double predictNextMonthExpense(List<Double> monthlyExpenses) {
        if (monthlyExpenses == null || monthlyExpenses.isEmpty()) {
            return 0.0;
        }

        int n = monthlyExpenses.size();
        int window = Math.min(3, n);

        double sum = 0;
        for (int i = n - window; i < n; i++) {
            sum += monthlyExpenses.get(i);
        }
        return sum / window;
    }
}