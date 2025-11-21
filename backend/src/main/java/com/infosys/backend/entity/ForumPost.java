package com.infosys.backend.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@Data
@Table(name="forumposts")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ForumPost {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
	private Users userId;
	
	@Column(name="title")
	private String title;
	@Column(name="content")
	private String content;
	@Column(name="created")
	private LocalDateTime created;
}