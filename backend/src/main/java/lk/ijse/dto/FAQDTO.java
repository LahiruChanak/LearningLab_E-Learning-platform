package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class FAQDTO {
    private Long faqId;
    private Long courseId;
    private String question;
    private String answer;
    private LocalDateTime createdAt;
}
