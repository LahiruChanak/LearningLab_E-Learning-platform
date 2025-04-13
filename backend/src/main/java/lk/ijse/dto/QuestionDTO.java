package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionDTO {
    private Long questionId;
    private Long quizId;
    private String questionText;
    private List<AnswerDTO> answers;
}
