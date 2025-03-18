package lk.ijse.service.impl;

import lk.ijse.dto.UserDTO;
import lk.ijse.entity.User;
import lk.ijse.repository.UserRepo;
import lk.ijse.service.UserService;
import lk.ijse.util.VarList;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@Transactional
public class UserServiceImpl implements UserService, UserDetailsService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                getAuthority(user)
        );
    }

    @Override
    public int saveUser(UserDTO userDTO) {
        if (userRepo.existsByEmail(userDTO.getEmail())) {
            return VarList.Not_Acceptable;
        }

        User user = modelMapper.map(userDTO, User.class);
        user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));
        user.setRole(User.Role.STUDENT); // Default role.
        userRepo.save(user);
        return VarList.Created;
    }

    @Override
    public int resetPassword(UserDTO userDTO) throws UsernameNotFoundException {
        User user = userRepo.findByEmail(userDTO.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userDTO.getEmail()));

        user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));
        userRepo.save(user);
        return VarList.Created;
    }

    private Set<SimpleGrantedAuthority> getAuthority(User user) {
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        return authorities;
    }
}