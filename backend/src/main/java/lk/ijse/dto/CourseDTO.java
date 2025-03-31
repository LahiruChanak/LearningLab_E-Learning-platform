package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CourseDTO {
    private Long courseId;
    private String title;
    private String description;
    private Long instructorId;
    private Long categoryId;
    private Double price;
    private String level;
    private String thumbnail;
    private Boolean isPublished;
}
