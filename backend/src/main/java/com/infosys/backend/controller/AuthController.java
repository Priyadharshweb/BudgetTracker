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

import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }
)
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
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        try {
            String token = request.getHeader("Authorization");

            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            token = token.substring(7);
            String email = jwtUtil.extractUsername(token);

            Users user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(@RequestBody Users updatedUser, HttpServletRequest request) {
        try {
            String token = request.getHeader("Authorization");

            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            token = token.substring(7);
            String email = jwtUtil.extractUsername(token);

            Users user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (updatedUser.getName() != null)
                user.setName(updatedUser.getName());

            if (updatedUser.getEmail() != null)
                user.setEmail(updatedUser.getEmail());

            userRepo.save(user);

            return ResponseEntity.ok("Profile updated successfully");

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

            Users user = userRepo.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String token = jwtUtil.generateToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody Users user) {
        System.out.println("=== SIGNUP DEBUG ===");
        System.out.println("Received user object: " + user);
        System.out.println("Name: '" + user.getName() + "'");
        System.out.println("Email: '" + user.getEmail() + "'");
        System.out.println("Password: " + (user.getPassword() != null ? "[PRESENT - Length: " + user.getPassword().length() + "]" : "[NULL]"));
        System.out.println("Role: " + user.getRole());
        System.out.println("==================");

        // Validate required fields
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            System.out.println("Name validation failed");
            return ResponseEntity.badRequest().body("Name is required");
        }
        
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            System.out.println("Email validation failed");
            return ResponseEntity.badRequest().body("Email is required");
        }
        
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            System.out.println("Password validation failed");
            return ResponseEntity.badRequest().body("Password is required");
        }

        // Check if user already exists
        Optional<Users> existingUser = userRepo.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            System.out.println("User already exists");
            return ResponseEntity.badRequest().body("User already exists");
        }

        try {
            // Encode password
            user.setPassword(passwordEncoder.encode(user.getPassword()));

            // Set default role if not provided
            if (user.getRole() == null) {
                user.setRole(Role.USER);
            }

            Users savedUser = userRepo.save(user);
            System.out.println("User saved successfully with ID: " + savedUser.getId());
            
            return ResponseEntity.ok("User registered successfully");

        } catch (Exception e) {
            System.out.println("Error saving user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }
}
