package lk.ijse.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lk.ijse.dto.CourseDTO;
import lk.ijse.entity.Category;
import lk.ijse.entity.Course;
import lk.ijse.entity.Instructor;
import lk.ijse.repository.CategoryRepo;
import lk.ijse.repository.CourseRepo;
import lk.ijse.repository.InstructorRepo;
import lk.ijse.service.CourseService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepo courseRepo;

    @Autowired
    private InstructorRepo instructorRepo;

    @Autowired
    private CategoryRepo categoryRepo;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<CourseDTO> getInstructorCourses(String instructorEmail) {
        Instructor instructor = instructorRepo.findByUserEmail(instructorEmail)
                .orElseThrow(() -> new RuntimeException("Instructor not found with email: " + instructorEmail));
        List<Course> courses = courseRepo.findByInstructor(instructor);
        return courses.stream()
                .map(course -> modelMapper.map(course, CourseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CourseDTO createCourse(CourseDTO courseDTO, MultipartFile thumbnail, String instructorEmail) {
        Instructor instructor = instructorRepo.findByUserEmail(instructorEmail)
                .orElseThrow(() -> new RuntimeException("Instructor not found with email: " + instructorEmail));

        Category category = categoryRepo.findById(courseDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + courseDTO.getCategoryId()));

        Course course = new Course();
        course.setTitle(courseDTO.getTitle());
        course.setDescription(courseDTO.getDescription());
        course.setInstructor(instructor);
        course.setCategory(category);
        course.setPrice(courseDTO.getPrice());
        course.setLevel(Course.Level.valueOf(courseDTO.getLevel().toUpperCase()));
        course.setCreatedAt(LocalDateTime.now());
        course.setIsPublished(courseDTO.getIsPublished() != null ? courseDTO.getIsPublished() : false);

        if (thumbnail != null && !thumbnail.isEmpty()) {
            try {
                Map uploadResult = cloudinary.uploader().upload(thumbnail.getBytes(), ObjectUtils.asMap(
                        "public_id", "course_thumbnails/" + instructorEmail + "_" + System.currentTimeMillis() + "_" + thumbnail.getOriginalFilename(),
                        "overwrite", true,
                        "resource_type", "image"
                ));
                course.setThumbnail((String) uploadResult.get("secure_url"));
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload thumbnail: " + e.getMessage());
            }
        }

        courseRepo.save(course);
        return modelMapper.map(course, CourseDTO.class);
    }

    @Override
    @Transactional
    public CourseDTO updateCourse(Long courseId, CourseDTO courseDTO, MultipartFile thumbnail, String instructorEmail) {

        Course course = courseRepo.findByInstructorEmailAndCourseId(instructorEmail, courseId)
                .orElseThrow(() -> new RuntimeException("Course not found or you don’t have permission to update it"));


        if (courseDTO.getTitle() != null) course.setTitle(courseDTO.getTitle());
        if (courseDTO.getDescription() != null) course.setDescription(courseDTO.getDescription());
        if (courseDTO.getCategoryId() != null) {
            Category category = categoryRepo.findById(courseDTO.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with ID: " + courseDTO.getCategoryId()));
            course.setCategory(category);
        }
        if (courseDTO.getPrice() != null) course.setPrice(courseDTO.getPrice());
        if (courseDTO.getLevel() != null) course.setLevel(Course.Level.valueOf(courseDTO.getLevel().toUpperCase()));
        if (courseDTO.getIsPublished() != null) course.setIsPublished(courseDTO.getIsPublished());

        if (thumbnail != null && !thumbnail.isEmpty()) {
            try {
                Map uploadResult = cloudinary.uploader().upload(thumbnail.getBytes(), ObjectUtils.asMap(
                        "public_id", "course_thumbnails/" + instructorEmail + "_" + System.currentTimeMillis() + "_" + thumbnail.getOriginalFilename(),
                        "overwrite", true,
                        "resource_type", "image"
                ));
                course.setThumbnail((String) uploadResult.get("secure_url"));
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload thumbnail: " + e.getMessage());
            }
        }

        courseRepo.save(course);
        return modelMapper.map(course, CourseDTO.class);
    }

    @Override
    @Transactional
    public void deleteCourse(Long courseId, String instructorEmail) {

        Course course = courseRepo.findByInstructorEmailAndCourseId(instructorEmail, courseId)
                .orElseThrow(() -> new RuntimeException("Course not found or you don’t have permission to delete it"));

        courseRepo.delete(course);
    }
}
