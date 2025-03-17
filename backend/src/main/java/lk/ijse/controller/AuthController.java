package lk.ijse.controller;

import jakarta.validation.Valid;
import lk.ijse.dto.AuthDTO;
import lk.ijse.dto.ResponseDTO;
import lk.ijse.dto.UserDTO;
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
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    @PostMapping("/verify-otp")
    public ResponseEntity<ResponseDTO> verifyOtpAndRegister(
            @RequestParam String email,
            @RequestParam String otp,
            @RequestBody @Valid UserDTO userDTO) {
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
                            .body(new ResponseDTO(VarList.Created, "Registration successful", authDTO));
                case VarList.Not_Acceptable:
                    return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
                            .body(new ResponseDTO(VarList.Not_Acceptable, "Email already used", null));
                default:
                    return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                            .body(new ResponseDTO(VarList.Bad_Gateway, "Error", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(VarList.Internal_Server_Error, e.getMessage(), null));
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<ResponseDTO> authenticate(
            @RequestBody Map<String, String> credentials) {
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
}