package com.infosys.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.infosys.backend.dto.JwtResponse;
import com.infosys.backend.dto.LoginRequest;
import com.infosys.backend.entity.Role;
import com.infosys.backend.entity.Users;
import com.infosys.backend.repository.UserRepository;
import com.infosys.backend.security.JwtUtil;

import java.util.Optional;

@RestController
@CrossOrigin(origins="http://localhost:5173/")
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Authenticate user
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // Fetch user details
            Users users = userRepo.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate JWT token
            String token = jwtUtil.generateToken(users);

            return ResponseEntity.ok(new JwtResponse(token));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
    }

    // ✅ SIGNUP
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody Users user) {
        Optional<Users> existingUser = userRepo.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body("User already exists");
        }

        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Default role USER if not provided
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }

        userRepo.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

}

