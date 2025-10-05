package com.infosys.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.backend.entity.Exports;

@Repository
public interface ExportsRepository extends JpaRepository<Exports, Long>{

}
