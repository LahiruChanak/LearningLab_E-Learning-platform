package lk.ijse.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_skill", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "skill_id"}))
@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_skill_id")
    private Long userSkillId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency")
    private Proficiency proficiency;

    @Column(name = "acquired_at")
    private LocalDateTime acquiredAt = LocalDateTime.now();

    public enum Proficiency {
        BEGINNER, INTERMEDIATE, EXPERT
    }
}