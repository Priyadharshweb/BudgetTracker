package com.infosys.backend.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.backend.entity.Exports;
import com.infosys.backend.repository.ExportsRepository;

@Service
public class ExportsService {
	@Autowired
    private ExportsRepository exportsRepo;

    public Exports createExport(Exports data) {
        return exportsRepo.save(data);
    }

}
