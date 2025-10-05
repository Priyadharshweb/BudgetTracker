package com.infosys.backend.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ExportsRequestDTO {
	private Long user_id;
    private String format;
    private LocalDateTime exported;

}
