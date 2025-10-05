package com.infosys.backend.repository;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.backend.entity.ForumComments;


@Repository
public interface ForumCommentsRepository extends JpaRepository<ForumComments, Long>{

	


}
