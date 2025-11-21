package com.infosys.backend.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.backend.entity.ForumComments;


@Repository
public interface ForumCommentsRepository extends JpaRepository<ForumComments, Long>{
	List<ForumComments> findByPostId_Id(Long postId);

}
