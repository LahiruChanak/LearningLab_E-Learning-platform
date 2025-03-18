package lk.ijse.service;

import lk.ijse.dto.UserDTO;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public interface UserService {

    UserDetails loadUserByUsername(String email) throws UsernameNotFoundException;

    int saveUser(UserDTO userDTO);

    int resetPassword(UserDTO userDTO) throws UsernameNotFoundException;

}