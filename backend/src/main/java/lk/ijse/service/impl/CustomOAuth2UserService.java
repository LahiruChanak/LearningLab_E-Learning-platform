package lk.ijse.service.impl;

import lk.ijse.dto.UserDTO;
import lk.ijse.entity.User;
import lk.ijse.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
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