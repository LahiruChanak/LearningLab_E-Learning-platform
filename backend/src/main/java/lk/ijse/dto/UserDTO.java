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
}
