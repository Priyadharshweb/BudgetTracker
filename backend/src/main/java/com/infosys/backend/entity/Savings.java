package com.infosys.backend.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name="savings")
@Data
public class Savings {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
	private Users user;
	@Column(name="goal_name")
	private String goal_name;
	@Column(name="target_amt")
	private double target_amt;
	@Column(name="curr_amt")
	private double curr_amt;
	@Column(name="deadline")
	private LocalDate deadline;

}
