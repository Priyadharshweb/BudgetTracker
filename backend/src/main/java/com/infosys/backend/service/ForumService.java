package com.infosys.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.backend.entity.ForumPost;
import com.infosys.backend.repository.ForumPostsRepository;

@Service
public class ForumService {
	@Autowired
    private ForumPostsRepository forumPostRepo;


    public ForumPost createPost(ForumPost post) {
        return forumPostRepo.save(post);
    }

}
