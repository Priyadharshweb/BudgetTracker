package com.infosys.backend.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.infosys.backend.entity.Users;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {
	@Autowired
	com.infosys.backend.repository.UserRepository userRepo;
	@Autowired
	private PasswordEncoder passwordEncoder;
	public List<Users> fetchUser() {
		// TODO Auto-generated method stub
		return userRepo.findAll();
	}

	public Users findById(long id) {
		// TODO Auto-generated method stub
		return userRepo.findById(id).orElse(null);
	}

	public Users creatingUser(Users data) {
		// TODO Auto-generated method stub
		data.setPassword(passwordEncoder.encode(data.getPassword()));
	    return userRepo.save(data);
	}

	public String deletingUser(long id) {
		// TODO Auto-generated method stub
		if(userRepo.existsById(id))
        {
              userRepo.deleteById(id);
              return "id deleted succefully";
        }
        else
        {
            return id+ "Data not found";
        }
        
	}

	public String updatingUser(long id, Users data2) {
	    Optional<Users> optionalUser = userRepo.findById(id);
	    
	    if (optionalUser.isPresent()) {
	        Users existingUser = optionalUser.get();

	        // ✅ Update only necessary fields
	        existingUser.setName(data2.getName());
	        existingUser.setEmail(data2.getEmail());
	        existingUser.setPassword(data2.getPassword());
	        // Add more fields as needed

	        userRepo.save(existingUser); // ✅ Save updated user

	        return "User updated successfully";
	    } else {
	        return "User not found";
	    }
	}


}
