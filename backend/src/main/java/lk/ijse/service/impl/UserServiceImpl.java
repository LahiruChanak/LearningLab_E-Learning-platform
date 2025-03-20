package lk.ijse.service.impl;

import lk.ijse.dto.UserDTO;
import lk.ijse.entity.User;
import lk.ijse.repository.UserRepo;
import lk.ijse.service.UserService;
import lk.ijse.util.VarList;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
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
        user.setRole(User.Role.STUDENT);
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

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    @Override
    public void updateProfile(User user) {
        userRepo.save(user);
    }

    @Service
    public static class CustomOAuth2UserService extends DefaultOAuth2UserService {
        @Autowired
        private UserService userService;

        @Override
        public OAuth2User loadUser(OAuth2UserRequest userRequest) {
            OAuth2User oAuth2User = super.loadUser(userRequest);
            String email = oAuth2User.getAttribute("email");
            String fullName = oAuth2User.getAttribute("name");

            Optional<User> existingUser = userService.findByEmail(email);
            if (existingUser.isEmpty()) {
                UserDTO userDTO = new UserDTO();
                userDTO.setEmail(email);
                userDTO.setFullName(fullName);
                userDTO.setPassword("google-authenticated");
                userDTO.setRole(User.Role.STUDENT);
                userService.saveUser(userDTO);
            }

            Set<GrantedAuthority> authorities = new HashSet<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_STUDENT"));
            return new DefaultOAuth2User(authorities, oAuth2User.getAttributes(), "email");
        }
    }
}