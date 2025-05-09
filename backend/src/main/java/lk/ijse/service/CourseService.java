package lk.ijse.service;

import lk.ijse.dto.CourseDTO;
import lk.ijse.dto.InstructorDetailsDTO;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CourseService {

    CourseDTO createCourse(CourseDTO courseDTO, MultipartFile thumbnail, String instructorEmail);

    CourseDTO updateCourse(Long courseId, CourseDTO courseDTO, MultipartFile thumbnail, UserDetails userDetails);

    void deleteCourse(Long courseId, String instructorEmail);

    List<CourseDTO> getInstructorCourses(String instructorEmail);

    List<CourseDTO> getFilteredCourses(String instructorEmail, Long categoryId, String level, Boolean isPublished, String title);

    List<CourseDTO> getAllCourses();

    List<CourseDTO> getPublishedCourses();

    InstructorDetailsDTO getInstructorDetailsByCourseId(Long courseId);

}
