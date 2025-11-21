package com.infosys.backend.service;

import com.infosys.backend.entity.ExpensePredictionModel;
import com.infosys.backend.entity.Transactions;
import com.infosys.backend.repository.TransactionsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExpensePredictionService {

    @Autowired
    private TransactionsRepository transactionsRepository;

    private final ExpensePredictionModel model = new ExpensePredictionModel();

    public double predictNextMonthExpenses(Long userId) {

        // FIXED: use injected bean, not class name
        List<Transactions> transactions = transactionsRepository.findByUserId(userId);

        // FIXED: parse date string to LocalDate
        Map<YearMonth, Double> monthlyExpenses = transactions.stream()
                .filter(t -> t.getType().equalsIgnoreCase("expense"))
                .collect(Collectors.groupingBy(
                        t -> YearMonth.from(LocalDate.parse(t.getDate())),
                        Collectors.summingDouble(Transactions::getAmount)
                ));

        // Sorting
        List<YearMonth> sortedMonths = new ArrayList<>(monthlyExpenses.keySet());
        Collections.sort(sortedMonths);

        // Extract totals
        List<Double> totals = sortedMonths.stream()
                .map(monthlyExpenses::get)
                .collect(Collectors.toList());

        return model.predictNextMonthExpense(totals);
    }
}
