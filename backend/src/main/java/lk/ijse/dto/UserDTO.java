package lk.ijse.dto;

import lk.ijse.entity.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserDTO {
    private Long userId;
    private String fullName;
    private String email;
    private String password;
    private User.Role role;
    private String profilePicture;
    private String bio;
    private String contact;
    private String address;
    private String githubLink;
    private String linkedinLink;
    private String stackOverflowLink;
    private String websiteLink;
    private String passwordUpdatedAt;
    private String emailUpdatedAt;
    private boolean twoFactorEnabled;
    private LocalDateTime createdAt;
    private boolean isActive;
    private Integer courseCount;    // for instructor
}
