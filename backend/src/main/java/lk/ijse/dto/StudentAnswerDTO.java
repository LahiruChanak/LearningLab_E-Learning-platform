package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class StudentAnswerDTO {
    private Long questionId;
    private String questionText;
    private Long selectedAnswerId;
    private String selectedAnswerText;
    private boolean isCorrect;
}
