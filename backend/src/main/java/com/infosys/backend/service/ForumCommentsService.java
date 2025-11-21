package com.infosys.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.backend.entity.ForumComments;
import com.infosys.backend.repository.ForumCommentsRepository;

@Service
public class ForumCommentsService {

    @Autowired
    private ForumCommentsRepository commentsRepo;

    // ✔ Create comment
    public ForumComments createComment(ForumComments comment) {
        return commentsRepo.save(comment);
    }

    // ✔ Get comments for a post
    public List<ForumComments> getCommentsByPostId(Long postId) {
        return commentsRepo.findByPostId_Id(postId);
    }

    // ✔ Get single comment for delete
    public Optional<ForumComments> getCommentById(Long commentId) {
        return commentsRepo.findById(commentId);
    }

    // ✔ Delete comment
    public void deleteComment(Long commentId) {
        commentsRepo.deleteById(commentId);
    }
}
