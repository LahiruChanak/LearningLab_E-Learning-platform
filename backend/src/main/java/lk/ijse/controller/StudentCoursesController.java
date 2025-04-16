package lk.ijse.controller;

import lk.ijse.dto.StudentCoursesDTO;
import lk.ijse.service.StudentCoursesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/student/course")
@RequiredArgsConstructor
public class StudentCoursesController {

    private final StudentCoursesService studentCoursesService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentCoursesDTO> getStudentCourses(Authentication authentication) {
        String studentEmail = authentication.getName();
        StudentCoursesDTO studentCourses = studentCoursesService.getStudentCourses(studentEmail);
        return ResponseEntity.ok(studentCourses);
    }
}
