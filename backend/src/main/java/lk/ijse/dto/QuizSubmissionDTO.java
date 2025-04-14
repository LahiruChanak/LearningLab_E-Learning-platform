package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class QuizSubmissionDTO {
    private Long quizId;
    private Long userId;
    private List<AnswerSubmissionDTO> answers;
}
