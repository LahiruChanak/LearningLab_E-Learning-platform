package lk.ijse.controller;

import lk.ijse.dto.EnrollmentDTO;
import lk.ijse.dto.ResponseDTO;
import lk.ijse.entity.Enrollment;
import lk.ijse.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/enrollment")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @GetMapping("/check")
    public ResponseEntity<ResponseDTO> checkEnrollment(
            @RequestParam Long studentId,
            @RequestParam Long courseId,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }

        Optional<Enrollment> enrollment = enrollmentService.getEnrollment(studentId, courseId);
        if (enrollment.isPresent()) {
            Enrollment e = enrollment.get();
            Map<String, Object> enrollmentData = Map.of(
                    "enrollmentId", e.getEnrollmentId(),
                    "completedVideoIds", e.getCompletedVideoIds()
            );
            return ResponseEntity.ok(new ResponseDTO(200, "Student is enrolled", enrollmentData));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDTO(404, "Student not enrolled", null));
        }
    }

    @PostMapping("/enroll")
    public ResponseEntity<EnrollmentDTO> enrollStudent(
            @RequestParam Long studentId,
            @RequestParam Long courseId) {
        EnrollmentDTO enrollmentDto = enrollmentService.enrollStudent(studentId, courseId);
        return ResponseEntity.ok(enrollmentDto);
    }

    @PutMapping("/{enrollmentId}/complete-video")
    public ResponseEntity<EnrollmentDTO> updateCompletedVideo(
            @PathVariable Long enrollmentId,
            @RequestParam Long videoId) {
        EnrollmentDTO enrollmentDto = enrollmentService.updateCompletedVideos(enrollmentId, videoId);
        return ResponseEntity.ok(enrollmentDto);
    }
}
