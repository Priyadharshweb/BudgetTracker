package com.infosys.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class Users {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @JsonProperty("name")
    @Column(nullable = false)
    private String name;
    
    @JsonProperty("email")
    @Column(nullable = false, unique = true)
    private String email;
    
    @JsonProperty("password")
    @Column(nullable = false)
    private String password;
    
    @JsonProperty("role")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    // Default constructor
    public Users() {}
    
    // Constructor with parameters
    public Users(String name, String email, String password, Role role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    
    @Override
    public String toString() {
        return "Users(id=" + id + ", name=" + name + ", email=" + email + 
               ", password=" + (password != null ? "[PRESENT]" : "[NULL]") + 
               ", role=" + role + ")";
    }
}
