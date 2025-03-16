package lk.ijse.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "course_resource")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class CourseResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Long resourceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private ResourceType type;

    @Column(name = "url", nullable = false, length = 255)
    private String url;

    @Column(name = "upload_date", updatable = false)
    private LocalDateTime uploadDate = LocalDateTime.now();

    public enum ResourceType {
        IMAGE, VIDEO, DOCUMENT, ARCHIVE, LINK
    }
}