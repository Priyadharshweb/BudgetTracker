package com.infosys.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.backend.dto.ExportsRequestDTO;
import com.infosys.backend.entity.Exports;
import com.infosys.backend.entity.Users;
import com.infosys.backend.repository.UserRepository;
import com.infosys.backend.service.ExportsService;

@RestController
@RequestMapping("/api/exports")
public class ExportsController {
	 @Autowired
	    private ExportsService exportsService;

	    @Autowired
	    private UserRepository userRepo;

	    @PostMapping
	    public Exports createExport(@RequestBody ExportsRequestDTO dto) {
	        Users user = userRepo.findById(dto.getUser_id())
	                             .orElseThrow(() -> new RuntimeException("User not found"));

	        Exports export = new Exports();
	        export.setUser_id(user);
	        export.setFormat(dto.getFormat());
	        export.setExported(dto.getExported());

	        return exportsService.createExport(export);
	    }

}
