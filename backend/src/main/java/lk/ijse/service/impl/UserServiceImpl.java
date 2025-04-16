package lk.ijse.service.impl;

import com.cloudinary.Cloudinary;
import dev.samstevens.totp.code.*;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import lk.ijse.dto.UserDTO;
import lk.ijse.entity.User;
import lk.ijse.entity.UserSkill;
import lk.ijse.repository.CourseRepo;
import lk.ijse.repository.UserRepo;
import lk.ijse.service.UserService;
import lk.ijse.util.VarList;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService, UserDetailsService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private CourseRepo courseRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private Cloudinary cloudinary;

    private final String ADMIN_EMAIL = "fitlifeifms@gmail.com";

    private final Map<String, String> otpStore = new HashMap<>();
    private final DefaultSecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final CodeGenerator codeGenerator = new DefaultCodeGenerator();
    private final TimeProvider timeProvider = new SystemTimeProvider();
    private final CodeVerifier codeVerifier;

    public UserServiceImpl() {
        this.codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
        ((DefaultCodeVerifier) codeVerifier).setAllowedTimePeriodDiscrepancy(1);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (!user.getIsActive()) {
            throw new DisabledException("Account is deactivated or pending account deletion. Please contact admin.");
        }

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

        if (ADMIN_EMAIL.equalsIgnoreCase(userDTO.getEmail())) {
            user.setRole(User.Role.ADMIN);
        } else {
            user.setRole(User.Role.STUDENT);
        }

        userRepo.save(user);
        return VarList.Created;
    }

    @Override
    public void saveOAuth2User(User user) {
        if (userRepo.existsByEmail(user.getEmail())) {
            return;
        }
        userRepo.save(user);
    }

    @Override
    public int resetPassword(UserDTO userDTO) throws UsernameNotFoundException {
        User user = userRepo.findByEmail(userDTO.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userDTO.getEmail()));

        user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));
        user.setPasswordUpdatedAt(LocalDateTime.now());
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

    @Override
    public int updatePassword(String email, String currentPassword, String newPassword) throws Exception {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new Exception("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordUpdatedAt(LocalDateTime.now());
        userRepo.save(user);
        return VarList.Created;
    }

    @Override
    public int updateEmail(String currentEmail, String password, String newEmail) throws Exception {
        User user = userRepo.findByEmail(currentEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + currentEmail));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new Exception("Password is incorrect");
        }
        if (userRepo.existsByEmail(newEmail)) {
            throw new Exception("New email is already in use");
        }
        user.setEmail(newEmail);
        user.setEmailUpdatedAt(LocalDateTime.now());
        userRepo.save(user);
        return VarList.Created;
    }

    @Override
    public String generate2FASecret(String email) throws Exception {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        String secret = secretGenerator.generate();
        user.setTwoFactorSecret(secret);
        userRepo.save(user);
        return secret;
    }

    @Override
    public String getQrData(String email, String secret) throws Exception {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        QrData data = new QrData.Builder()
                .label(email)
                .secret(secret)
                .issuer("LearningLab - LMS")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();
        return data.getUri();
    }

    @Override
    public boolean verify2FACode(String email, String code) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        String secret = user.getTwoFactorSecret();

        if (secret == null) {
            return false;
        }
        return codeVerifier.isValidCode(secret, code);
    }

    @Override
    public void enable2FA(String email) throws Exception {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        user.setTwoFactorEnabled(true);
        userRepo.save(user);
    }

    @Override
    public void disable2FA(String email) throws Exception {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepo.save(user);
    }

    @Override
    public boolean is2FAEnabled(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return user.isTwoFactorEnabled();
    }

    @Override
    public User loadUserByUsernameEntity(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Override
    public User getCurrentUser(String email) {
        return loadUserByUsernameEntity(email);
    }

    @Override
    public void requestAccountDeletion(String email, String password) throws Exception {
        // Verify credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        user.setIsActive(false);
        user.setDeactivatedAt(LocalDateTime.now());
        userRepo.save(user);
    }

    @Override
    public void permanentlyDeleteInactiveAccounts() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<User> inactiveUsers = userRepo.findByIsActiveFalseAndDeactivatedAtBefore(thirtyDaysAgo);
        userRepo.deleteAll(inactiveUsers);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepo.findAll();
        return users.stream().map(user -> {
            UserDTO dto = modelMapper.map(user, UserDTO.class);
            if (user.getRole() == User.Role.INSTRUCTOR) {
                dto.setCourseCount(courseRepo.countByInstructorUserUserId(user.getUserId()));
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public Optional<User> findById(Long userId) {
        return userRepo.findById(userId);
    }

}