package lk.ijse.controller;

import lk.ijse.dto.CourseDTO;
import lk.ijse.dto.ResponseDTO;
import lk.ijse.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping("/course")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN', 'STUDENT')")
    public ResponseEntity<ResponseDTO> getCourses(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ResponseDTO(401, "Unauthorized", null));
            }

            List<CourseDTO> courses;
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            boolean isInstructor = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_INSTRUCTOR"));
            boolean isStudent = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_STUDENT"));

            if (isAdmin) {
                courses = courseService.getAllCourses();
                return ResponseEntity.ok(new ResponseDTO(200, "All courses fetched successfully", courses));
            } else if (isInstructor) {
                courses = courseService.getInstructorCourses(userDetails.getUsername());
                return ResponseEntity.ok(new ResponseDTO(200, "Instructor courses fetched successfully", courses));
            } else if (isStudent) {
                courses = courseService.getPublishedCourses();
                return ResponseEntity.ok(new ResponseDTO(200, "Published courses fetched successfully", courses));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ResponseDTO(401, "Unauthorized", null));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDTO(404, e.getMessage(), null));
        }
    }

    @PostMapping(value = "/instructor/course", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ResponseDTO> addCourse(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("courseDTO") CourseDTO courseDTO,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ResponseDTO(401, "Unauthorized", null));
            }
            CourseDTO createdCourse = courseService.createCourse(courseDTO, thumbnail, userDetails.getUsername());
            return ResponseEntity.ok(new ResponseDTO(200, "Course added successfully", createdCourse));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error adding course: " + e.getMessage(), null));
        }
    }

    @PutMapping(value = "/instructor/course/{courseId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ResponseDTO> updateCourse(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @RequestPart("courseDTO") CourseDTO courseDTO,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ResponseDTO(401, "Unauthorized", null));
            }
            CourseDTO updatedCourse = courseService.updateCourse(courseId, courseDTO, thumbnail, userDetails);
            return ResponseEntity.ok(new ResponseDTO(200, "Course updated successfully", updatedCourse));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Course not found") || e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseDTO(404, e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error updating course: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/instructor/course/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ResponseDTO> deleteCourse(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ResponseDTO(401, "Unauthorized", null));
            }
            courseService.deleteCourse(courseId, userDetails.getUsername());
            return ResponseEntity.ok(new ResponseDTO(200, "Course deleted successfully", null));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Course not found") || e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseDTO(404, e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error deleting course: " + e.getMessage(), null));
        }
    }

    @GetMapping("/instructor/course/filter")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ResponseDTO> getFilteredCourses(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "level", required = false) String level,
            @RequestParam(value = "isPublished", required = false) Boolean isPublished,
            @RequestParam(value = "title", required = false) String title) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
            List<CourseDTO> courses = courseService.getFilteredCourses(userDetails.getUsername(), categoryId, level, isPublished, title);
            return ResponseEntity.ok(new ResponseDTO(200, "Filtered courses fetched successfully", courses));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDTO(404, e.getMessage(), null));
        }
    }
}
