package lk.ijse.controller;

import jakarta.servlet.http.HttpServletResponse;
import lk.ijse.dto.AuthDTO;
import lk.ijse.dto.ResponseDTO;
import lk.ijse.dto.UserDTO;
import lk.ijse.entity.User;
import lk.ijse.service.UserService;
import lk.ijse.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.util.HashMap;
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
    public ResponseEntity<ResponseDTO> sendOtp(@RequestParam String email) {
        try {
            String otp = otpUtil.generateOtp(email);
            emailUtil.sendOtpEmail(email, otp, "registration");
            return ResponseEntity.ok(new ResponseDTO(200, "OTP sent successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Failed to send OTP: " + e.getMessage(), null));
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
                    User user = userService.findByEmail(userDTO.getEmail())
                            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
                    AuthDTO authDTO = new AuthDTO(userDTO.getEmail(), token, user.getRole().name());
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
            String email = credentials.get("email");
            UserDetails userDetails = userService.loadUserByUsername(email);

            if (userService.is2FAEnabled(email)) {
                return ResponseEntity.ok(new ResponseDTO(206, "2FA required", Map.of("email", email)));
            }

            String token = jwtUtil.generateToken(userDetails);
            // Fetch the user to get the role
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
            AuthDTO authDTO = new AuthDTO(email, token, user.getRole().name());

            return ResponseEntity.ok(new ResponseDTO(200, "Login successful", authDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Invalid credentials", null));
        }
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<ResponseDTO> verify2FA(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        if (userService.verify2FACode(email, code)) {
            UserDetails userDetails = userService.loadUserByUsername(email);
            String token = jwtUtil.generateToken(userDetails);
            AuthDTO authDTO = new AuthDTO(email, token);
            return ResponseEntity.ok(new ResponseDTO(200, "2FA verified, login successful", authDTO));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, "Invalid 2FA code", null));
        }
    }

    // Send OTP for Password Reset
    @PostMapping("/reset-pw-otp")
    public ResponseEntity<ResponseDTO> sendResetPasswordOtp(@RequestParam String email) {
        try {
            String otp = otpUtil.generateOtp(email);
            emailUtil.sendOtpEmail(email, otp, "password reset");
            return ResponseEntity.ok(new ResponseDTO(200, "Reset OTP sent successfully", null));
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDTO(404, "User not found", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Failed to send reset OTP: " + e.getMessage(), null));
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

//    @GetMapping("/google")
//    public void redirectToGoogle(HttpServletResponse response) throws IOException {
//        response.sendRedirect("/oauth2/authorization/google");
//    }

}