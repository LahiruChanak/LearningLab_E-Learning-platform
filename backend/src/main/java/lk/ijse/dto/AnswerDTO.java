package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnswerDTO {
    private Long answerId;
    private Long questionId;
    private String answerText;
    private boolean isCorrect;
}
