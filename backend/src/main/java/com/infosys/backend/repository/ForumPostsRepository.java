package com.infosys.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.backend.entity.ForumPost;

@Repository
public interface ForumPostsRepository extends JpaRepository<ForumPost, Long>{

}
