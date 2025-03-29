package lk.ijse.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("api/v1/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private Cloudinary cloudinary;

    private static final String[] ALLOWED_IMG_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/gif"};
    private static final String[] ALLOWED_FILE_TYPES = {"image/jpeg", "image/png", "image/gif", "application/pdf"};
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
            // Validate file size and type
            if (image.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseDTO(400, "File size must be less than 5MB", null));
            }
            if (!isValidImageType(image.getContentType())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseDTO(400, "Only JPG, PNG, and GIF are supported", null));
            }

            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            // Upload to Cloudinary
            Map uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.asMap(
                    "public_id", "profile_pictures/" + user.getUserId() + "_" + System.currentTimeMillis(),
                    "overwrite", true,
                    "resource_type", "image"
            ));

            String imageUrl = (String) uploadResult.get("secure_url");

            // Delete old image from Cloudinary if it exists
            if (user.getProfilePicture() != null) {
                String oldPublicId = extractPublicIdFromUrl(user.getProfilePicture());
                cloudinary.uploader().destroy(oldPublicId, ObjectUtils.emptyMap());
            }

            // Update user with Cloudinary URL
            user.setProfilePicture(imageUrl);
            userService.updateProfile(user);

            return ResponseEntity.ok(new ResponseDTO(200, "Profile image uploaded", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error uploading image: " + e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Unexpected error: " + e.getMessage(), null));
        }
    }

    private boolean isValidImageType(String contentType) {
        return contentType != null && Arrays.asList(ALLOWED_IMG_TYPES).contains(contentType.toLowerCase());
    }

    private String extractPublicIdFromUrl(String url) {
        // Extract public_id from Cloudinary URL, e.g., "profile_pictures/123_169..."
        String[] parts = url.split("/");
        String fileName = parts[parts.length - 1];
        return "profile_pictures/" + fileName.substring(0, fileName.lastIndexOf("."));
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
                userDTO.setProfilePicture(user.getProfilePicture());
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
            // Other fields like bio, contact, etc.
            userService.updateProfile(user);

            UserDTO updatedDTO = modelMapper.map(user, UserDTO.class);
            if (user.getProfilePicture() != null) {
                updatedDTO.setProfilePicture(user.getProfilePicture());
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

            if (user.getProfilePicture() != null) {
                String publicId = extractPublicIdFromUrl(user.getProfilePicture());
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                user.setProfilePicture(null);
                userService.updateProfile(user);
            }
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResponseDTO> submitInstructorRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @ModelAttribute InstructorRequestDTO requestDTO,
            @RequestParam("certificates") MultipartFile[] certificates) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }

        String email = userDetails.getUsername();

        try {
            // Handle certificate uploads
            List<String> certificateUrls = new ArrayList<>();
            if (certificates != null && certificates.length > 0) {
                for (MultipartFile certificate : certificates) {
                    if (!certificate.isEmpty()) {
                        if (certificate.getSize() > MAX_FILE_SIZE) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(new ResponseDTO(400, "Certificate file size must be less than 5MB", null));
                        }
                        if (!isValidFileType(certificate.getContentType())) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(new ResponseDTO(400, "Only JPG, PNG, GIF, and PDF are supported", null));
                        }

                        Map uploadResult = cloudinary.uploader().upload(certificate.getBytes(), ObjectUtils.asMap(
                                "public_id", "instructor_certificates/" + email + "_" + System.currentTimeMillis() + "_" + certificate.getOriginalFilename(),
                                "overwrite", true,
                                "resource_type", "auto"
                        ));
                        certificateUrls.add((String) uploadResult.get("secure_url"));
                    }
                }
            }

            requestDTO.setCertificateUrls(certificateUrls);
            UserDTO userDTO = userService.submitInstructorRequest(userDetails, requestDTO);
            return ResponseEntity.ok(new ResponseDTO(200, "Request submitted successfully", userDTO));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error uploading certificates: " + e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Failed to submit request: " + e.getMessage(), null));
        }
    }

    private boolean isValidFileType(String contentType) {
        return contentType != null && Arrays.asList(ALLOWED_FILE_TYPES).contains(contentType.toLowerCase());
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

    @PostMapping("/delete/account")
    public ResponseEntity<ResponseDTO> deleteAccount(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        try {
            userService.requestAccountDeletion(email, password);
            return ResponseEntity.ok(new ResponseDTO(200, "Account marked for deletion. It will be permanently removed in 30 days.", null));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error processing deletion request: " + e.getMessage(), null));
        }
    }

}