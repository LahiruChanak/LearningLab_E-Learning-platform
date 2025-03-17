package lk.ijse.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/v1/auth/**").permitAll() // Allow all requests to /api/v1/auth/**
                        .anyRequest().authenticated() // Other endpoints require authentication
                )
                .csrf(csrf -> csrf.disable())   // Disable CSRF for simplicity (enable if needed later)
                .formLogin(formLogin -> formLogin.disable()) // Disable form login
                .httpBasic(httpBasic -> httpBasic.disable()); // Disable HTTP Basic Auth

        return http.build();
    }
}