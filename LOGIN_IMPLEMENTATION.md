# Implementing Login with Spring Security

This guide will walk you through implementing a login mechanism in your Spring Boot application using Spring Security. We'll cover basic setup, custom `UserDetailsService`, and configuring security for your endpoints.

## 1. Overview of Spring Security

Spring Security is a powerful and highly customizable authentication and access-control framework. It is the de-facto standard for securing Spring-based applications.

Key features:
- **Authentication**: Verifying who the user is (e.g., username/password).
- **Authorization**: Determining what the authenticated user is allowed to do.
- Protection against common attacks like CSRF and session fixation.

## 2. Dependencies

First, ensure you have the necessary Spring Security dependency in your `pom.xml` (if using Maven):

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</gen_code_segment>
```

If you are using Gradle, add the following to your `build.gradle`:

```gradle
implementation 'org.springframework.boot:spring-boot-starter-security'
```

## 3. Security Configuration

You already have a `SecurityConfig.java` file. We will modify this file to configure form-based login and endpoint security.

`src/main/java/com/party/ceva/demo/config/SecurityConfig.java`

```java
package com.party.ceva.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for simplicity in API, consider enabling for web apps
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/users/login", "/api/users/register").permitAll() // Allow unauthenticated access to login and register
                .anyRequest().authenticated() // All other requests require authentication
            )
            .formLogin(form -> form
                .loginProcessingUrl("/api/users/login") // URL to submit username and password to
                .usernameParameter("username") // Username parameter name
                .passwordParameter("password") // Password parameter name
                .successHandler((request, response, authentication) -> {
                    response.setStatus(200); // OK
                    response.getWriter().write("Login successful");
                })
                .failureHandler((request, response, exception) -> {
                    response.setStatus(401); // Unauthorized
                    response.getWriter().write("Login failed: " + exception.getMessage());
                })
                .permitAll() // Allow everyone to access the login page
            )
            .logout(logout -> logout
                .logoutUrl("/api/users/logout") // URL to trigger logout
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(200); // OK
                    response.getWriter().write("Logout successful");
                })
                .permitAll()
            );
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

**Explanation of changes:**
- `csrf.disable()`: CSRF protection is often disabled for stateless APIs. For traditional web applications, it's crucial to keep it enabled.
- `authorizeHttpRequests`:
    - `.requestMatchers("/api/users/login", "/api/users/register").permitAll()`: Allows anyone to access the login and registration endpoints without authentication.
    - `.anyRequest().authenticated()`: All other requests to your application will require authentication.
- `formLogin`: Configures form-based authentication.
    - `.loginProcessingUrl("/api/users/login")`: The URL where the login form will be submitted. Spring Security handles this URL, you don't need a controller for it.
    - `.usernameParameter("username")`, `.passwordParameter("password")`: Specifies the names of the parameters that contain the username and password in the login request.
    - `.successHandler`, `.failureHandler`: Custom handlers to manage successful and failed login attempts for API responses.
- `logout`: Configures logout functionality.
    - `.logoutUrl("/api/users/logout")`: The URL to trigger logout.
- `passwordEncoder()`: Defines a `BCryptPasswordEncoder` bean. This is essential for securely storing and verifying user passwords. **Never store plain text passwords.**

## 4. Custom User Details Service

Spring Security needs to know how to load user details. You'll create a custom `UserDetailsService` that retrieves user information from your `UserRepository`.

Create a new file `src/main/java/com/party/ceva/demo/service/CustomUserDetailsService.java`:

```java
package com.party.ceva.demo.service;

import com.party.ceva.demo.model.User;
import com.party.ceva.demo.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getEmail(), Collections.emptyList()); // Assuming email is the password for simplicity, you should use the actual hashed password from the database
    }
}
```

**Important Notes for `CustomUserDetailsService`:**
- **Password**: In the example above, `user.getEmail()` is used as a placeholder for the password. **You must replace this with the actual hashed password stored in your `User` entity.**
- **Roles/Authorities**: `Collections.emptyList()` is used for authorities. In a real application, you would load the user's roles or authorities from the database and provide them here.
- **`findByUsername`**: Your `UserRepository` needs a method to find a user by username. Add this to `UserRepository.java`:

    `src/main/java/com/party/ceva/demo/repository/UserRepository.java` (add this method inside the interface)
    ```java
    import java.util.Optional;
    import org.springframework.data.jpa.repository.JpaRepository;
    import com.party.ceva.demo.model.User;

    public interface UserRepository extends JpaRepository<User, Long> {
        Optional<User> findByUsername(String username);
    }
    ```
    This method will allow Spring Security to retrieve user details based on the provided username during authentication.

## 5. Register Endpoint (Optional but Recommended)

You'll need a way for users to register. This typically involves creating a new user, hashing their password, and saving it to the database.

Add a `register` method to your `UserService`:

`src/main/java/com/party/ceva/demo/service/UserService.java` (add this method)

```java
import org.springframework.security.crypto.password.PasswordEncoder; // Import this

// ... inside UserService class ...

private final PasswordEncoder passwordEncoder; // Inject PasswordEncoder

public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) { // Update constructor
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
}

public UserDto registerUser(UserDto userDto) {
    User user = new User();
    user.setUsername(userDto.getUsername());
    user.setEmail(userDto.getEmail());
    user.setPassword(passwordEncoder.encode(userDto.getPassword())); // Hash the password
    // Set user profile if available, similar to createUser
    User savedUser = userRepository.save(user);
    return toDto(savedUser);
}
```

**Note:** You'll need to add a `password` field to your `User` model and `UserDto`.

Then, expose this in your `UserController`:

`src/main/java/com/party/ceva/demo/controller/UserController.java` (add this method)

```java
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// ... other imports ...

@RestController
@RequestMapping("api/users")
public class UserController {
    // ... existing constructor and methods ...

    @PostMapping("/register")
    public UserDto registerUser(@RequestBody UserDto userDto) {
        return userService.registerUser(userDto);
    }
}
```

## 6. How to Test

Once configured:
- **Login**: Send a POST request to `/api/users/login` with `username` and `password` as form parameters (not JSON in the body).
- **Access Protected Endpoint**: After a successful login, you can access protected endpoints (e.g., `/api/users`) with the session cookie.
- **Logout**: Send a POST request to `/api/users/logout`.

This setup provides a basic login mechanism. You can further enhance it with JWT for stateless authentication, error handling, and more sophisticated authorization rules.
