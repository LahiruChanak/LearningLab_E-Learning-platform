package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class LessonDTO {
    private Long lessonId;
    private Long courseId;
    private String title;
    private Integer lessonSequence;
    private Boolean isPublished;
    private List<LessonVideoDTO> videos;
}
