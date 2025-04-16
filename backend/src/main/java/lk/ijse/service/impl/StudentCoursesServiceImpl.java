package lk.ijse.service.impl;

import lk.ijse.dto.CourseDTO;
import lk.ijse.dto.StudentCoursesDTO;
import lk.ijse.entity.Course;
import lk.ijse.entity.Enrollment;
import lk.ijse.entity.User;
import lk.ijse.repository.CourseRepo;
import lk.ijse.repository.EnrollmentRepo;
import lk.ijse.repository.UserRepo;
import lk.ijse.service.StudentCoursesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentCoursesServiceImpl implements StudentCoursesService {

    private final UserRepo userRepo;
    private final EnrollmentRepo enrollmentRepo;
    private final CourseRepo courseRepo;

    @Override
    public StudentCoursesDTO getStudentCourses(String studentEmail) {
        // Fetch the student by email
        User student = userRepo.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Fetch the student's enrollments
        List<Enrollment> enrollments = enrollmentRepo.findByStudent(student);

        // Extract the enrolled course IDs
        List<Long> enrolledCourseIds = enrollments.stream()
                .map(enrollment -> enrollment.getCourse().getCourseId())
                .collect(Collectors.toList());

        // Fetch enrolled courses
        List<Course> enrolledCourses = courseRepo.findByCourseIdIn(enrolledCourseIds);
        List<CourseDTO> enrolledCourseDTOs = enrolledCourses.stream()
                .map(this::mapToCourseDTO)
                .collect(Collectors.toList());

        // Fetch not enrolled courses
        List<Course> notEnrolledCourses = courseRepo.findByIsPublishedTrueAndCourseIdNotIn(enrolledCourseIds);
        List<CourseDTO> notEnrolledCourseDTOs = notEnrolledCourses.stream()
                .map(this::mapToCourseDTO)
                .collect(Collectors.toList());

        return new StudentCoursesDTO(enrolledCourseDTOs, notEnrolledCourseDTOs);
    }

    private CourseDTO mapToCourseDTO(Course course) {
        CourseDTO courseDTO = new CourseDTO();
        courseDTO.setCourseId(course.getCourseId());
        courseDTO.setTitle(course.getTitle());
        courseDTO.setDescription(course.getDescription());
        courseDTO.setHeadingTitles(course.getHeadingTitles());
        courseDTO.setInstructorId(course.getInstructor().getInstructorId());
        courseDTO.setCategoryId(course.getCategory().getCategoryId());
        courseDTO.setPrice(course.getPrice());
        courseDTO.setLevel(course.getLevel().toString());
        courseDTO.setThumbnail(course.getThumbnail());
        courseDTO.setIsPublished(course.getIsPublished());
        courseDTO.setCreatedAt(course.getCreatedAt());
        return courseDTO;
    }
}
