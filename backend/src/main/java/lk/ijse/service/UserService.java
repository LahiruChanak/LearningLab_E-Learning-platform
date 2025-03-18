package lk.ijse.service;

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

    void saveProfilePicture(User user);

}