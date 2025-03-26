package lk.ijse.service;

import lk.ijse.dto.InstructorRequestDTO;
import lk.ijse.dto.UserDTO;
import lk.ijse.entity.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

public interface UserService {

    UserDetails loadUserByUsername(String email) throws UsernameNotFoundException;

    int saveUser(UserDTO userDTO);

    int resetPassword(UserDTO userDTO) throws UsernameNotFoundException;

    Optional<User> findByEmail(String email);

    void updateProfile(User user);

    int updatePassword(String email, String currentPassword, String newPassword) throws Exception;

    int updateEmail(String currentEmail, String password, String newEmail) throws Exception;

    String generate2FASecret(String email) throws Exception;

    String getQrData(String email, String secret) throws Exception;

    boolean verify2FACode(String email, String code);

    void enable2FA(String email) throws Exception;

    void disable2FA(String email) throws Exception;

    boolean is2FAEnabled(String email);

    UserDTO submitInstructorRequest(UserDetails userDetails, InstructorRequestDTO requestDTO);

    User loadUserByUsernameEntity(String email);

    User getCurrentUser(String email);

    void requestAccountDeletion(String email, String password) throws Exception;

    void permanentlyDeleteInactiveAccounts();

}