package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class QuizResultDTO {
    private Long quizId;
    private Integer score;
    private Integer totalMarks;
    private boolean canRetake;
}
