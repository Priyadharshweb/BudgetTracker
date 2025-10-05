package com.infosys.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.backend.dto.ForumCommentsDTO;
import com.infosys.backend.entity.ForumComments;
import com.infosys.backend.entity.ForumPost;
import com.infosys.backend.entity.Users;
import com.infosys.backend.repository.ForumPostsRepository;
import com.infosys.backend.repository.UserRepository;
import com.infosys.backend.service.ForumCommentsService;


@RestController
@RequestMapping("/api/comments")
public class ForumCommentsController {
	 @Autowired
	    private ForumCommentsService commentsService;

	    @Autowired
	    private ForumPostsRepository postRepo;

	    @Autowired
	    private UserRepository userRepo;

	    @PostMapping
	    public ForumComments createComment(@RequestBody ForumCommentsDTO dto) {
	        ForumPost post = postRepo.findById(dto.getPost_id())
	                                 .orElseThrow(() -> new RuntimeException("Post not found"));
	        
	        Users user = userRepo.findById(dto.getUser_id())
	                             .orElseThrow(() -> new RuntimeException("User not found"));

	        ForumComments comment = new ForumComments();
	        comment.setPost_id(post);
	        comment.setUser_id(user);
	        comment.setComments(dto.getComments());
	        comment.setCreated_as(dto.getCreated_as());

	        return commentsService.createComment(comment);
	    }

    


}
