package com.infosys.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.backend.entity.ForumPost;
import com.infosys.backend.entity.Users;

@Repository
public interface ForumPostsRepository extends JpaRepository<ForumPost, Long> {
    List<ForumPost> findByUserId(Users user);   // ✔ MATCHES private Users userId;
}
