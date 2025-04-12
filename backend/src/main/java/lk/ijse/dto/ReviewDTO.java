package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReviewDTO {
    private Long reviewId;
    private Long courseId;
    private Long studentId;
    private String studentName;
    private String studentProfileImage;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
