package lk.ijse.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lk.ijse.dto.CourseResourceDTO;
import lk.ijse.entity.Course;
import lk.ijse.entity.CourseResource;
import lk.ijse.entity.Lesson;
import lk.ijse.repository.CourseRepo;
import lk.ijse.repository.CourseResourceRepo;
import lk.ijse.repository.LessonRepo;
import lk.ijse.service.CourseResourceService;
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
public class CourseResourceServiceImpl implements CourseResourceService {

    @Autowired
    private CourseResourceRepo courseResourceRepo;

    @Autowired
    private CourseRepo courseRepo;

    @Autowired
    private LessonRepo lessonRepo;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    @Transactional
    public CourseResourceDTO addResource(Long courseId, CourseResourceDTO resourceDTO, MultipartFile file, String instructorEmail) {

        Course course = courseRepo.findByInstructorEmailAndCourseId(instructorEmail, courseId)
                .orElseThrow(() -> new RuntimeException("Course not found or you don’t have permission"));

        CourseResource resource = new CourseResource();
        resource.setCourse(course);
        resource.setTitle(resourceDTO.getTitle());
        resource.setType(CourseResource.ResourceType.valueOf(resourceDTO.getType().toUpperCase()));

        if (resourceDTO.getType().equalsIgnoreCase("LINK")) {
            if (resourceDTO.getUrl() == null || resourceDTO.getUrl().isEmpty()) {
                throw new RuntimeException("URL is required for LINK type");
            }
            resource.setUrl(resourceDTO.getUrl());
        } else if (file != null && !file.isEmpty()) {
            try {
                Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "public_id", "course_resources/" + instructorEmail + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename(),
                        "overwrite", true,
                        "resource_type", resourceDTO.getType().equalsIgnoreCase("VIDEO") ? "video" : "auto"
                ));
                resource.setUrl((String) uploadResult.get("secure_url"));
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload file: " + e.getMessage());
            }
        } else {
            throw new RuntimeException("File is required for non-LINK types");
        }

        resource.setUploadDate(LocalDateTime.now());
        courseResourceRepo.save(resource);
        return modelMapper.map(resource, CourseResourceDTO.class);
    }

    @Override
    @Transactional
    public CourseResourceDTO updateResource(Long courseId, Long resourceId, CourseResourceDTO resourceDTO, MultipartFile file, String instructorEmail) {

        CourseResource resource = courseResourceRepo.findByResourceIdAndCourseCourseId(resourceId, courseId)
                .orElseThrow(() -> new RuntimeException("Resource not found or you don’t have permission"));

        if (!resource.getCourse().getInstructor().getUser().getEmail().equals(instructorEmail)) {
            throw new RuntimeException("You don’t have permission to update this resource");
        }

        if (resourceDTO.getTitle() != null) resource.setTitle(resourceDTO.getTitle());
        if (resourceDTO.getType() != null) {
            resource.setType(CourseResource.ResourceType.valueOf(resourceDTO.getType().toUpperCase()));
        }

        if (resourceDTO.getType().equalsIgnoreCase("LINK")) {
            if (resourceDTO.getUrl() == null || resourceDTO.getUrl().isEmpty()) {
                throw new RuntimeException("URL is required for LINK type");
            }
            resource.setUrl(resourceDTO.getUrl());
        } else if (file != null && !file.isEmpty()) {
            try {
                Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "public_id", "course_resources/" + instructorEmail + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename(),
                        "overwrite", true,
                        "resource_type", resourceDTO.getType().equalsIgnoreCase("VIDEO") ? "video" : "auto"
                ));
                resource.setUrl((String) uploadResult.get("secure_url"));
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload file: " + e.getMessage());
            }
        }

        courseResourceRepo.save(resource);
        return modelMapper.map(resource, CourseResourceDTO.class);
    }

    @Override
    @Transactional
    public void deleteResource(Long courseId, Long resourceId, String instructorEmail) {
        CourseResource resource = courseResourceRepo.findByResourceIdAndCourseCourseId(resourceId, courseId)
                .orElseThrow(() -> new RuntimeException("Resource not found or you don’t have permission"));

        if (!resource.getCourse().getInstructor().getUser().getEmail().equals(instructorEmail)) {
            throw new RuntimeException("You don’t have permission to delete this resource");
        }

        courseResourceRepo.delete(resource);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResourceDTO> getResourcesByCourseId(Long courseId) {
        List<CourseResource> resources = courseResourceRepo.findByCourseCourseId(courseId);
        return resources.stream()
                .map(resource -> modelMapper.map(resource, CourseResourceDTO.class))
                .collect(Collectors.toList());
    }

}
