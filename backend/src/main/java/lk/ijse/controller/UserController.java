package lk.ijse.controller;

import lk.ijse.dto.InstructorRequestDTO;
import lk.ijse.dto.ResponseDTO;
import lk.ijse.dto.UserDTO;
import lk.ijse.entity.User;
import lk.ijse.service.UserService;
import lk.ijse.util.VarList;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/v1/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ModelMapper modelMapper;

    private static final String UPLOAD_DIR = "backend/src/main/resources/static/uploads/certificates/";

    @PostMapping(value = "/profile/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResponseDTO> uploadProfileImage(
            @RequestParam("image") MultipartFile image,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }

        String email = authentication.getName();
        try {
            if (image.getSize() > 5 * 1024 * 1024) { // 5MB limit
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseDTO(400, "File size must be less than 5MB", null));
            }

            byte[] imageBytes = image.getBytes();
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            user.setProfilePicture(imageBytes);
            userService.updateProfile(user);

            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            return ResponseEntity.ok(new ResponseDTO(200, "Profile image uploaded", "data:image/jpeg;base64," + base64Image));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error uploading image: " + e.getMessage(), null));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<ResponseDTO> getUserProfile(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }

        String email = authentication.getName();

        try {
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            UserDTO userDTO = modelMapper.map(user, UserDTO.class);
            if (user.getProfilePicture() != null) {
                String base64Image = Base64.getEncoder().encodeToString(user.getProfilePicture());
                userDTO.setProfilePicture("data:image/jpeg;base64," + base64Image);
            }
            return ResponseEntity.ok(new ResponseDTO(200, "User profile retrieved", userDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, e.getMessage(), null));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ResponseDTO> updateUserProfile(
            @RequestBody UserDTO userDTO,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }

        String email = authentication.getName();

        try {
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            if (userDTO.getFullName() != null) user.setFullName(userDTO.getFullName());
            if (userDTO.getBio() != null) user.setBio(userDTO.getBio());
            if (userDTO.getContact() != null) user.setContact(userDTO.getContact());
            if (userDTO.getAddress() != null) user.setAddress(userDTO.getAddress());
            if (userDTO.getGithubLink() != null) user.setGithubLink(userDTO.getGithubLink());
            if (userDTO.getLinkedinLink() != null) user.setLinkedinLink(userDTO.getLinkedinLink());
            if (userDTO.getStackOverflowLink() != null) user.setStackOverflowLink(userDTO.getStackOverflowLink());
            if (userDTO.getWebsiteLink() != null) user.setWebsiteLink(userDTO.getWebsiteLink());

            userService.updateProfile(user);
            UserDTO updatedDTO = modelMapper.map(user, UserDTO.class);
            if (user.getProfilePicture() != null) {
                String base64Image = Base64.getEncoder().encodeToString(user.getProfilePicture());
                updatedDTO.setProfilePicture("data:image/jpeg;base64," + base64Image);
            }
            return ResponseEntity.ok(new ResponseDTO(200, "Profile updated successfully", updatedDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error updating profile: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/profile/image")
    public ResponseEntity<ResponseDTO> removeProfileImage(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }

        String email = authentication.getName();
        try {
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            user.setProfilePicture(null);
            userService.updateProfile(user);
            return ResponseEntity.ok(new ResponseDTO(200, "Profile image removed", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error removing image: " + e.getMessage(), null));
        }
    }

    @PostMapping("/profile/password")
    public ResponseEntity<ResponseDTO> updatePassword(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }

        try {
            String email = authentication.getName();
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseDTO(400, "Current and new passwords are required", null));
            }

            int result = userService.updatePassword(email, currentPassword, newPassword);

            if (result == VarList.Created) {
                return ResponseEntity.ok(new ResponseDTO(200, "Password updated successfully", null));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(new ResponseDTO(502, "Error updating password", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @PostMapping("/profile/email")
    public ResponseEntity<ResponseDTO> updateEmail(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }
        try {
            String currentEmail = authentication.getName();
            String password = request.get("password");
            String newEmail = request.get("newEmail");

            if (password == null || newEmail == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseDTO(400, "Password and new email are required", null));
            }

            int result = userService.updateEmail(currentEmail, password, newEmail);

            if (result == VarList.Created) {
                return ResponseEntity.ok(new ResponseDTO(200, "Email updated successfully", null));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(new ResponseDTO(502, "Error updating email", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @GetMapping("/2fa/setup")
    public ResponseEntity<ResponseDTO> setup2FA(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }
        try {
            String email = authentication.getName();
            String secret = userService.generate2FASecret(email);
            String qrData = userService.getQrData(email, secret);
            Map<String, String> data = Map.of("secret", secret, "qrData", qrData);
            return ResponseEntity.ok(new ResponseDTO(200, "2FA setup data", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<ResponseDTO> enable2FA(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }
        try {
            String email = authentication.getName();
            String code = request.get("code");
            if (code == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseDTO(400, "Verification code is required", null));
            }
            if (userService.verify2FACode(email, code)) {
                userService.enable2FA(email);
                return ResponseEntity.ok(new ResponseDTO(200, "2FA enabled successfully", null));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseDTO(400, "Invalid verification code", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<ResponseDTO> disable2FA(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }
        try {
            String email = authentication.getName();
            userService.disable2FA(email);
            return ResponseEntity.ok(new ResponseDTO(200, "2FA disabled successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @PostMapping(value = "/instructor/request", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResponseDTO> submitInstructorRequest(
            @RequestParam("message") String message,
            @RequestParam("qualifications") String qualifications,
            @RequestParam(value = "certificates", required = false) List<MultipartFile> certificates,
            @RequestParam("experience") String experience,
            @RequestParam(value = "additionalDetails", required = false) String additionalDetails,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Create upload directory if it doesn't exist
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        List<String> certificatePaths = null;
        if (certificates != null && !certificates.isEmpty()) {
            User user = userService.loadUserByUsernameEntity(userDetails.getUsername());
            Long userId = user.getUserId();
            certificatePaths = certificates.stream().map(file -> {
                try {
                    String originalFilename = file.getOriginalFilename();
                    String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                    String uniqueFilename = UUID.randomUUID().toString() + "_" + userId + extension;
                    String filePath = UPLOAD_DIR + uniqueFilename;

                    Path path = Paths.get(filePath);
                    file.transferTo(path);

                    return filePath;
                } catch (IOException e) {
                    throw new RuntimeException("Failed to save certificate file: " + file.getOriginalFilename(), e);
                }
            }).collect(Collectors.toList());
        }

        InstructorRequestDTO requestDTO = new InstructorRequestDTO(
                message,
                qualifications,
                certificatePaths,
                experience,
                additionalDetails
        );

        try {
            UserDTO userDTO = userService.submitInstructorRequest(userDetails, requestDTO);
            return ResponseEntity.ok(new ResponseDTO(200, "Instructor request submitted successfully", userDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, e.getMessage(), null));
        }
    }

    @GetMapping("/current")
    public ResponseEntity<ResponseDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }

        String username = authentication.getName();
        User user = userService.getCurrentUser(username);
        Map<String, Object> userData = Map.of(
                "fullName", user.getFullName(),
                "email", user.getEmail()
        );
        return ResponseEntity.ok(new ResponseDTO(200, "User data retrieved", userData));
    }

}