package lk.ijse.controller;

import jakarta.servlet.http.HttpServletResponse;
import lk.ijse.dto.AuthDTO;
import lk.ijse.dto.ResponseDTO;
import lk.ijse.dto.UserDTO;
import lk.ijse.entity.User;
import lk.ijse.service.UserService;
import lk.ijse.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private OtpUtil otpUtil;

    @Autowired
    private EmailUtil emailUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    // Send OTP for User Registration
    @PostMapping("/send-otp")
    public ResponseDTO sendOtp(@RequestParam String email) {
        try {
            String otp = otpUtil.generateOtp(email);
            emailUtil.sendOtpEmail(email, otp, "registration");
            return new ResponseDTO(200, "OTP sent successfully", null);
        } catch (Exception e) {
            return new ResponseDTO(500, "Failed to send OTP: " + e.getMessage(), null);
        }
    }

    // User Registration
    @PostMapping("/verify-otp")
    public ResponseEntity<ResponseDTO> verifyOtp(
            @RequestParam String email,
            @RequestParam String otp,
            @RequestBody UserDTO userDTO) {
        if (!otpUtil.validateOtp(email, otp)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, "Invalid OTP", null));
        }

        try {
            int res = userService.saveUser(userDTO);
            switch (res) {
                case VarList.Created:
                    UserDetails userDetails = userService.loadUserByUsername(userDTO.getEmail());
                    String token = jwtUtil.generateToken(userDetails);
                    AuthDTO authDTO = new AuthDTO(userDTO.getEmail(), token);
                    otpUtil.removeOtp(email);
                    return ResponseEntity.status(HttpStatus.CREATED)
                            .body(new ResponseDTO(VarList.Created, "Registration successful. Login to continue", authDTO));
                case VarList.Not_Acceptable:
                    return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
                            .body(new ResponseDTO(VarList.Not_Acceptable, "Email already used. Use another email!", null));
                default:
                    return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                            .body(new ResponseDTO(VarList.Bad_Gateway, "Error", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(VarList.Internal_Server_Error, e.getMessage(), null));
        }
    }

    // User Login
    @PostMapping("/authenticate")
    public ResponseEntity<ResponseDTO> authenticate(@RequestBody Map<String, String> credentials) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            credentials.get("email"),
                            credentials.get("password")
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetails userDetails = userService.loadUserByUsername(credentials.get("email"));
            String token = jwtUtil.generateToken(userDetails);
            AuthDTO authDTO = new AuthDTO(credentials.get("email"), token);

            return ResponseEntity.ok(new ResponseDTO(200, "Login successful", authDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Invalid credentials", null));
        }
    }

    // Send OTP for Password Reset
    @PostMapping("/reset-pw-otp")
    public ResponseDTO sendResetPasswordOtp(@RequestParam String email) {
        try {
            String otp = otpUtil.generateOtp(email);
            emailUtil.sendOtpEmail(email, otp, "password reset");
            return new ResponseDTO(200, "Reset OTP sent successfully", null);
        } catch (UsernameNotFoundException e) {
            return new ResponseDTO(404, "User not found", null);
        } catch (Exception e) {
            return new ResponseDTO(500, "Failed to send reset OTP: " + e.getMessage(), null);
        }
    }

    // Reset Password
    @PostMapping("/reset-password")
    public ResponseEntity<ResponseDTO> resetPassword(
            @RequestParam String email,
            @RequestParam String otp,
            @RequestParam String newPassword) {
        if (!otpUtil.validateOtp(email, otp)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, "Invalid OTP. Please try again", null));
        }

        try {
            UserDTO userDTO = new UserDTO();
            userDTO.setEmail(email);
            userDTO.setPassword(newPassword);
            int res = userService.resetPassword(userDTO);
            if (res == VarList.Created) {
                otpUtil.removeOtp(email);
                return ResponseEntity.ok(new ResponseDTO(200, "Password reset successful", null));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(new ResponseDTO(VarList.Bad_Gateway, "Error resetting password", null));
            }
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDTO(404, "User not found", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(VarList.Internal_Server_Error, e.getMessage(), null));
        }
    }

    @GetMapping("/google")
    public void redirectToGoogle(HttpServletResponse response) throws IOException {
        response.sendRedirect("/oauth2/authorization/google");
    }

//    @GetMapping("/google/callback")
//    public void googleCallback(OAuth2AuthenticationToken authentication, HttpServletResponse response) throws IOException {
//        OAuth2User oAuth2User = authentication.getPrincipal();
//        String email = oAuth2User.getAttribute("email");
//        String fullName = oAuth2User.getAttribute("name");
//
//        Optional<User> existingUser = userService.findByEmail(email);
//        String token;
//
//        if (existingUser.isEmpty()) {
//            UserDTO userDTO = new UserDTO();
//            userDTO.setEmail(email);
//            userDTO.setFullName(fullName);
//            userDTO.setPassword(new BCryptPasswordEncoder().encode("google-authenticated")); // mock password
//            userDTO.setRole(User.Role.STUDENT);
//
//            int saveResult = userService.saveUser(userDTO);
//            if (saveResult == VarList.Created) {
//                UserDetails userDetails = userService.loadUserByUsername(email);
//                token = jwtUtil.generateToken(userDetails);
//            } else if (saveResult == VarList.Not_Acceptable) {
//                UserDetails userDetails = userService.loadUserByUsername(email);
//                token = jwtUtil.generateToken(userDetails);
//            } else {
//                throw new RuntimeException("Unexpected save result: " + saveResult);
//            }
//        } else {
//            // Login: Use existing user
//            UserDetails userDetails = userService.loadUserByUsername(email);
//            token = jwtUtil.generateToken(userDetails);
//        }
//
//        response.sendRedirect("http://localhost:5500/frontend/pages/student/student-dashboard.html?token=" + token);
//    }
}