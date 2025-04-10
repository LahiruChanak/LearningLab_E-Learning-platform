package lk.ijse.config;

import lk.ijse.service.UserService;
//import lk.ijse.service.impl.CustomOAuth2UserService;
import lk.ijse.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    @Autowired
    private final UserService userService;

    @Autowired
    private final JwtFilter jwtFilter;

    @Autowired
    private final JwtUtil jwtUtil;

//    @Autowired
//    private CustomOAuth2UserService customOAuth2UserService;

//    @Autowired
//    private ClientRegistrationRepository clientRegistrationRepository;

    public WebSecurityConfig(UserService userService, JwtFilter jwtFilter, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtFilter = jwtFilter;
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

//    @Bean
//    public OAuth2AuthorizationRequestResolver authorizationRequestResolver() {
//        DefaultOAuth2AuthorizationRequestResolver resolver =
//                new DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository, "/oauth2/authorization");
//        resolver.setAuthorizationRequestCustomizer(
//                request -> {
//                    Map<String, Object> additionalParams = new HashMap<>();
//                    additionalParams.put("prompt", "consent");
//                    request.additionalParameters(additionalParams);
//                }
//        );
//        return resolver;
//    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Add CORS configuration
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**").permitAll()     // Permit all auth requests
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/send-otp",
                                "/api/v1/auth/verify-otp",
                                "/api/v1/auth/authenticate",
                                "/api/v1/auth/reset-password",
                                "/api/v1/auth/reset-pw-otp",
                                "/api/v1/auth/2fa/verify").permitAll()
                        .requestMatchers("/api/v1/user/instructor/request").authenticated()
                        .requestMatchers("/api/v1/user/current").authenticated()
                        .requestMatchers("/api/v1/user/delete/account").permitAll()
                        .requestMatchers("/api/v1/user/**").authenticated()
                        .requestMatchers("/api/v1/instructor/**").authenticated()
                        .requestMatchers("/api/v1/course/**").authenticated()
                        .requestMatchers("/api/v1/category/**").authenticated()
                        .requestMatchers("/api/v1/chat/**").authenticated()
                        .requestMatchers("/api/v1/admin/**").hasAuthority("ROLE_ADMIN")
                        .anyRequest().authenticated()
                )
//                .oauth2Login(oauth2 -> oauth2
//                        .authorizationEndpoint(authorization -> authorization
//                                .baseUri("/oauth2/authorization")
//                                .authorizationRequestResolver(authorizationRequestResolver())
//                        )
//                        .redirectionEndpoint(redirection -> redirection
//                                .baseUri("/api/v1/auth/google/callback")
//                        )
//                        .userInfoEndpoint(userInfo -> userInfo
//                                .userService(customOAuth2UserService)
//                        )
//                        .successHandler((request, response, authentication) -> {
//                            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
//                            String email = oAuth2User.getAttribute("email");
//                            String token = jwtUtil.generateToken(userService.loadUserByUsername(email));
//                            response.sendRedirect("http://localhost:5500/frontend/pages/student/student-dashboard.html?token=" + token);
//                        })
//                        .failureHandler((request, response, exception) -> {
//                            response.sendRedirect("http://localhost:5500/frontend/index.html?error=" + exception.getMessage());
//                        })
//                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:8080", "http://127.0.0.1:5500", "http://localhost:63342"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "*"));
        configuration.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/v1/**", configuration);
        return source;
    }

}