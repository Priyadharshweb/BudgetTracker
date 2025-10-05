package com.infosys.backend.dto;

import lombok.Data;

@Data
public class BudgetRequestDTO {
	private Long user_id;
    private String category;
    private double amount;
    private String startDate;
    private String endDate;
}
