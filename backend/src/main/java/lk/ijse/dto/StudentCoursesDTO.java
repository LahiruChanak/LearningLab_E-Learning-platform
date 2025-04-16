package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class StudentCoursesDTO {
    private List<CourseDTO> enrolledCourses;
    private List<CourseDTO> notEnrolledCourses;
}
