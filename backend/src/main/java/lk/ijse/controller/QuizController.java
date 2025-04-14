package lk.ijse.controller;

import lk.ijse.dto.QuizDTO;
import lk.ijse.dto.ResponseDTO;
import lk.ijse.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course/{courseId}/quizzes")
@PreAuthorize("hasRole('INSTRUCTOR')")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping
    public ResponseEntity<ResponseDTO> addQuiz(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @RequestBody QuizDTO quizDTO) {
        try {
            QuizDTO createdQuiz = quizService.addQuiz(courseId, quizDTO, userDetails.getUsername());
            return ResponseEntity.ok(new ResponseDTO(200, "Quiz added successfully", createdQuiz));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @PutMapping("/{quizId}")
    public ResponseEntity<ResponseDTO> updateQuiz(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @PathVariable Long quizId,
            @RequestBody QuizDTO quizDTO) {
        try {
            QuizDTO updatedQuiz = quizService.updateQuiz(courseId, quizId, quizDTO, userDetails.getUsername());
            return ResponseEntity.ok(new ResponseDTO(200, "Quiz updated successfully", updatedQuiz));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{quizId}")
    public ResponseEntity<ResponseDTO> deleteQuiz(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @PathVariable Long quizId) {
        try {
            quizService.deleteQuiz(courseId, quizId, userDetails.getUsername());
            return ResponseEntity.ok(new ResponseDTO(200, "Quiz deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ResponseDTO> getQuizzes(@PathVariable Long courseId) {
        try {
            List<QuizDTO> quizzes = quizService.getQuizzesByCourseId(courseId);
            return ResponseEntity.ok(new ResponseDTO(200, "Quizzes retrieved successfully", quizzes));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    // @PatchMapping => update only provided properties
    @PatchMapping("/{quizId}/publish")
    public ResponseEntity<ResponseDTO> toggleQuizPublication(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @PathVariable Long quizId) {
        try {
            QuizDTO updatedQuiz = quizService.toggleQuizPublication(courseId, quizId, userDetails.getUsername());
            String message = updatedQuiz.isPublished() ? "Quiz published successfully" : "Quiz unpublished successfully";
            return ResponseEntity.ok(new ResponseDTO(200, message, updatedQuiz));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }
}
