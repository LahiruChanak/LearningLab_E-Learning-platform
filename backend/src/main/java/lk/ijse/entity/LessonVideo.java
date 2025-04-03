package lk.ijse.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Entity
@Table(name = "lesson_video")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class LessonVideo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "video_id")
    private Long videoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "video_url", nullable = false, length = 500)
    private String videoUrl;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "video_sequence")
    private Integer videoSequence;
}
