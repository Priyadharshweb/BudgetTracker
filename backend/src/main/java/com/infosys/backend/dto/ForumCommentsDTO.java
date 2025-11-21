package com.infosys.backend.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class ForumCommentsDTO {
    private Long postId;       // rename properly
    private String comments;
    private LocalDateTime createdAs;  // must match entity field
}
