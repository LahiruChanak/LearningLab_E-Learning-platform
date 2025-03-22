package lk.ijse.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "password_updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime passwordUpdatedAt;

    @Column(name = "email_updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime emailUpdatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Lob
    @Column(name = "profile_picture" , columnDefinition = "LONGBLOB")
    private byte[] profilePicture;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "contact_number", length = 15, unique = true, columnDefinition = "CHAR(15)")
    private String contact;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "github_link")
    private String githubLink;

    @Column(name = "linkedin_link")
    private String linkedinLink;

    @Column(name = "stackOverflow_link")
    private String stackOverflowLink;

    @Column(name = "website_link")
    private String websiteLink;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserSkill> skills;

    @OneToMany(mappedBy = "instructor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Course> coursesTaught;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Enrollment> enrollments;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Orders> orders;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Certificate> certificates;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizAttempt> quizAttempts;

    public enum Role {
        ADMIN, STUDENT, INSTRUCTOR
    }

}