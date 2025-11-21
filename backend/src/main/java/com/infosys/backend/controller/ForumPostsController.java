package com.infosys.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.infosys.backend.dto.ForumPostRequestDTO;
import com.infosys.backend.entity.ForumPost;
import com.infosys.backend.entity.Users;
import com.infosys.backend.repository.ForumPostsRepository;
import com.infosys.backend.repository.UserRepository;
import com.infosys.backend.service.ForumService;

@RestController
@CrossOrigin(origins = "http://localhost:5173/")
@RequestMapping("/api/forumposts")
public class ForumPostsController {

    @Autowired
    private ForumService forumPostService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ForumPostsRepository forumPostRepository;

    // ✅ Fetch all posts of logged-in user
    @GetMapping
    public ResponseEntity<List<ForumPost>> getAllCommunityPosts() {
        List<ForumPost> allPosts = forumPostRepository.findAll();
        return ResponseEntity.ok(allPosts);
    }

    // ✅ Create new post
    @PostMapping
    public ResponseEntity<ForumPost> createPost(@RequestBody ForumPostRequestDTO dto,
                                                Authentication authentication) {
        String userEmail = authentication.getName();
        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ForumPost post = new ForumPost();
        post.setUserId(user);  // ✔ Lombok setter name changes to setUserId()
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setCreated(dto.getCreated());

        ForumPost savedPost = forumPostService.createPost(post);
        return ResponseEntity.ok(savedPost);
    }

    // ✅ Update post
    @PutMapping("/{id}")
    public ResponseEntity<ForumPost> updatePost(@PathVariable Long id,
                                                @RequestBody ForumPostRequestDTO dto,
                                                Authentication authentication) {

        String userEmail = authentication.getName();
        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ForumPost existingPost = forumPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!existingPost.getUserId().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        existingPost.setTitle(dto.getTitle());
        existingPost.setContent(dto.getContent());
        existingPost.setCreated(dto.getCreated());

        ForumPost updatedPost = forumPostRepository.save(existingPost);
        return ResponseEntity.ok(updatedPost);
    }

    // ✅ Delete post
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id,
                                           Authentication authentication) {

        String userEmail = authentication.getName();
        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ForumPost post = forumPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUserId().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        forumPostRepository.delete(post);
        return ResponseEntity.ok().build();
    }
}
