package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizDTO {
    private Long quizId;
    private Long courseId;
    private String title;
    private String description;
    private Integer totalMarks;
    private Integer passingMarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isPublished;
    private List<QuestionDTO> questions;
}
