package lk.ijse.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "achievement")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Achievement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "achievement_id")
    private Long achievementId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT", length = 1000)
    private String description;

    @Column(name = "achieved_at", nullable = false, updatable = false)
    private LocalDateTime achievedAt = LocalDateTime.now();

    @Column(name = "certificate_url", length = 255)
    private String certificateUrl;
}