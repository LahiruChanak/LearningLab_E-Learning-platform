package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class LessonVideoDTO {
    private Long videoId;
    private String videoUrl;
    private String title;
    private Integer duration;
    private Integer videoSequence;
}
