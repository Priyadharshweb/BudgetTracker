package com.infosys.backend.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ForumPostRequestDTO {
	private Long user_id;
    private String title;
    private String content;
    private LocalDateTime created;

}
