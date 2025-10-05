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
import jakarta.servlet.http.HttpServletRequest;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
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

    @GetMapping("/profile")
    public ResponseEntity<Users> getProfile(HttpServletRequest request) {
        try {
            String token = request.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                String email = jwtUtil.extractUsername(token);
                Users user = userRepo.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(user);
            }
            return ResponseEntity.status(401).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(null);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(@RequestBody Users updatedUser, HttpServletRequest request) {
        try {
            String token = request.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                String email = jwtUtil.extractUsername(token);
                Users user = userRepo.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                
                user.setName(updatedUser.getName());
                user.setEmail(updatedUser.getEmail());
                userRepo.save(user);
                
                return ResponseEntity.ok("Profile updated successfully");
            }
            return ResponseEntity.status(401).body("Unauthorized");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating profile");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            Users users = userRepo.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String token = jwtUtil.generateToken(users);
            return ResponseEntity.ok(new JwtResponse(token));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody Users user) {
        Optional<Users> existingUser = userRepo.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body("User already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }

        userRepo.save(user);
        return ResponseEntity.ok("User registered successfully");
    }
}
