package lk.ijse.controller;

import lk.ijse.util.EmailUtil;
import lk.ijse.util.OtpUtil;
import lk.ijse.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private OtpUtil otpUtil;

    @Autowired
    private EmailUtil emailUtil;

    @PostMapping("/send-otp")
    public ResponseUtil sendOtp(@RequestParam String email) {
        try {
            String otp = otpUtil.generateOtp(email);
            String purpose = "registration";
            emailUtil.sendOtpEmail(email, otp, purpose);
            return new ResponseUtil(200, "OTP sent successfully. Please check your email.", null);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseUtil(500, "Failed to send OTP: " + e.getMessage(), null);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseUtil verifyOtp(@RequestParam String email, @RequestParam String otp) {
        if (otpUtil.validateOtp(email, otp)) {
            otpUtil.removeOtp(email);
            return new ResponseUtil(200, "OTP verified successfully", null);
        }
        return new ResponseUtil(400, "Invalid OTP. Please try again.", null);
    }
}