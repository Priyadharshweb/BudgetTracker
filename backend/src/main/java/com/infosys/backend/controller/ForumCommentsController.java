package com.infosys.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.infosys.backend.dto.ForumCommentsDTO;
import com.infosys.backend.entity.ForumComments;
import com.infosys.backend.entity.ForumPost;
import com.infosys.backend.entity.Users;
import com.infosys.backend.repository.ForumPostsRepository;
import com.infosys.backend.repository.UserRepository;
import com.infosys.backend.service.ForumCommentsService;

@RestController
@CrossOrigin(origins = "http://localhost:5173/")
@RequestMapping("/api/comments")
public class ForumCommentsController {

    @Autowired
    private ForumCommentsService commentsService;

    @Autowired
    private ForumPostsRepository postRepo;

    @Autowired
    private UserRepository userRepo;

    // ✅ Get all comments for a post
    @GetMapping("/{postId}")
    public ResponseEntity<List<ForumComments>> getCommentsForPost(@PathVariable Long postId) {
        List<ForumComments> comments = commentsService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    // ✅ Create a new comment (logged-in user only)
    @PostMapping
    public ResponseEntity<ForumComments> createComment(
            @RequestBody ForumCommentsDTO dto,
            Authentication authentication
    ) {
        // identify logged-in user
        String userEmail = authentication.getName();
        Users user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // find post
        ForumPost post = postRepo.findById(dto.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // create entity
        ForumComments comment = new ForumComments();
        comment.setPostId(post);
        comment.setUserId(user);
        comment.setComments(dto.getComments());
        comment.setCreatedAs(dto.getCreatedAs());

        ForumComments savedComment = commentsService.createComment(comment);

        return ResponseEntity.ok(savedComment);
    }

    // ✅ Delete comment (only owner)
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        Users user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ForumComments comment = commentsService.getCommentById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        commentsService.deleteComment(commentId);
        return ResponseEntity.ok().build();
    }
}
