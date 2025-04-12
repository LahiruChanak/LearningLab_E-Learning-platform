package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CourseResourceDTO {
    private Long resourceId;
    private Long courseId;
    private String title;
    private String type;
    private String url;
    private LocalDateTime uploadDate;
}
