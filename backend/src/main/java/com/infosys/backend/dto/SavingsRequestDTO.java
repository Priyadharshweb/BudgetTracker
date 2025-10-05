package com.infosys.backend.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class SavingsRequestDTO {
	private Long user_id;
    private String goal_name;
    private double target_amt;
    private double curr_amt;
    private LocalDate deadline;

}
