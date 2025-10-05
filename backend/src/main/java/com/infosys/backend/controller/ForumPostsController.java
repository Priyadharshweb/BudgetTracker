package com.infosys.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.backend.dto.ForumPostRequestDTO;
import com.infosys.backend.entity.ForumPost;
import com.infosys.backend.entity.Users;
import com.infosys.backend.repository.UserRepository;
import com.infosys.backend.service.ForumService;

@RestController
@RequestMapping("/api/forumposts")
public class ForumPostsController {
	@Autowired
    private ForumService forumPostService;

    @Autowired
    private UserRepository userRepo;

    @PostMapping
    public ForumPost createPost(@RequestBody ForumPostRequestDTO dto) {
        Users user = userRepo.findById(dto.getUser_id())
                             .orElseThrow(() -> new RuntimeException("User not found"));

        ForumPost post = new ForumPost();
        post.setUser_id(user);
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setCreated(dto.getCreated());

        return forumPostService.createPost(post);
    }

}
