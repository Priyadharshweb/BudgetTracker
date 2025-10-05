package com.infosys.backend.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ForumCommentsDTO {
	private Long post_id;
    private Long user_id;
    private String comments;
    private LocalDateTime created_as;

}
