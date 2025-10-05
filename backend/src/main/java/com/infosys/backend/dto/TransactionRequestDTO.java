package com.infosys.backend.dto;

import lombok.Data;

@Data
public class TransactionRequestDTO {
	private Long user_id;
    private String type;
    private double amount;
    private String category;
    private String description;
    private String date;

}
