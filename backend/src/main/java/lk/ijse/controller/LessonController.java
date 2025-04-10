package lk.ijse.controller;

import lk.ijse.dto.LessonDTO;
import lk.ijse.service.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/instructor/lesson")
@CrossOrigin(origins = "*")
public class LessonController {
    @Autowired
    private LessonService lessonService;

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN', 'STUDENT')")
    public ResponseEntity<List<LessonDTO>> getLessonsByCourse(@PathVariable Long courseId) {
        List<LessonDTO> lessons = lessonService.getLessonsByCourse(courseId);
        return ResponseEntity.ok(lessons);
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<LessonDTO> createLesson(@RequestBody LessonDTO lessonDTO) {
        LessonDTO createdLesson = lessonService.createLesson(lessonDTO);
        return ResponseEntity.ok(createdLesson);
    }

    @PutMapping("/{lessonId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<LessonDTO> updateLesson(@PathVariable Long lessonId, @RequestBody LessonDTO lessonDTO) {
        LessonDTO updatedLesson = lessonService.updateLesson(lessonId, lessonDTO);
        return ResponseEntity.ok(updatedLesson);
    }

    @DeleteMapping("/{lessonId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long lessonId) {
        lessonService.deleteLesson(lessonId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/video/{videoId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteLessonVideo(@PathVariable Long videoId) {
        lessonService.deleteLessonVideo(videoId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/sequence")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> updateLessonSequence(@RequestBody List<LessonDTO> lessonDTOs) {
        lessonService.updateLessonSequence(lessonDTOs);
        return ResponseEntity.ok().build();
    }

}
