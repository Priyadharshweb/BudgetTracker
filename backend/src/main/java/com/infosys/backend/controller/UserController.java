package com.infosys.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.backend.entity.Users;
import com.infosys.backend.service.UserService;
@RestController
@CrossOrigin(origins="http://localhost:5173/")
@RequestMapping("/api/users")
public class UserController {
	@Autowired
	UserService userSer;

	@GetMapping
	public List<Users> getAllTask() {
		return userSer.fetchUser();

	}

	@GetMapping("/{id}")
	public Users getUserById(@PathVariable long id) {
		return userSer.findById(id); 
	}

	@PostMapping
	public Users createTask(@RequestBody Users data) {
		return userSer.creatingUser(data);
	}


	@DeleteMapping("/{id}")
	public String deleteTask(@PathVariable long id) {
		return userSer.deletingUser(id);
	}

	@PutMapping("/{id}")
	public String updateTask(@PathVariable long id, @RequestBody Users data2) {
		return userSer.updatingUser(id, data2);
	}


}

