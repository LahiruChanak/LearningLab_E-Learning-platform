package lk.ijse.dto;

import lk.ijse.entity.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserDTO {
    private String fullName;
    private String email;
    private String password;
    private User.Role role;
    private String profilePicture;  // Base64 encoded String.
    private String bio;
    private String contact;
    private String address;
    private String githubLink;
    private String linkedinLink;
    private String stackOverflowLink;
    private String websiteLink;
    private String updatedAt;
}
