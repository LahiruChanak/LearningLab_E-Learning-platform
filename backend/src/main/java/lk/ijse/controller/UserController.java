package lk.ijse.controller;

import lk.ijse.dto.ResponseDTO;
import lk.ijse.dto.UserDTO;
import lk.ijse.entity.User;
import lk.ijse.service.UserService;
import org.apache.commons.io.FilenameUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

@RestController
@RequestMapping("api/v1/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ModelMapper modelMapper;

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
            return ResponseEntity.ok(new ResponseDTO(200, "User profile retrieved", userDTO));
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDTO(404, "User not found", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, e.getMessage(), null));
        }
    }

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

            // Save image (example: to filesystem or cloud storage)
            String fileName = email + "_" + System.currentTimeMillis() + "." + FilenameUtils.getExtension(image.getOriginalFilename());
            String imagePath = "/uploads/" + fileName; // Adjust path as needed
            File dest = new File(System.getProperty("user.dir") + imagePath);
            image.transferTo(dest);

            // Update user profile
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            user.setProfilePicture(imagePath);
            userService.saveProfilePicture(user);

            return ResponseEntity.ok(new ResponseDTO(200, "Profile image uploaded", imagePath));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error uploading image: " + e.getMessage(), null));
        }
    }
}