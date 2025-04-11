package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Component
public class AuthDTO {
    private Long userId;
    private String email;
    private String token;
    private String role;

    public AuthDTO(String email, String token) {
        this.email = email;
        this.token = token;
    }

    public AuthDTO(String email, String token, String name) {
        this.email = email;
        this.token = token;
        this.role = name;
    }

    public AuthDTO(Long userId, String email, String token) {
        this.userId = userId;
        this.email = email;
        this.token = token;
    }
}
