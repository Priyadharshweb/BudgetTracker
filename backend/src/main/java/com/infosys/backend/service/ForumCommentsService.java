package com.infosys.backend.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.backend.entity.ForumComments;
import com.infosys.backend.repository.ForumCommentsRepository;


@Service
public class ForumCommentsService {
	@Autowired
    private ForumCommentsRepository commentsRepo;

    public ForumComments createComment(ForumComments comment) {
        return commentsRepo.save(comment);
    }
	
}
