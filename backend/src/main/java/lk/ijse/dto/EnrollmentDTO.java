package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class EnrollmentDTO {
    private Long enrollmentId;
    private Long studentId;
    private Long courseId;
    private LocalDateTime enrollmentDate;
    private Set<Long> completedVideoIds;
}
