package lk.ijse.controller;

import lk.ijse.dto.*;
import lk.ijse.entity.QuizResult;
import lk.ijse.repository.QuizResultRepo;
import lk.ijse.service.QuizService;
import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course/{courseId}/quiz")
@PreAuthorize("hasRole('INSTRUCTOR')")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @Autowired
    private QuizResultRepo quizResultRepo;

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
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN', 'STUDENT')")
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

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseDTO> submitQuiz(
            @PathVariable Long courseId,
            @RequestBody QuizSubmissionDTO submission) {
        try {
            QuizResultDTO result = quizService.submitQuiz(courseId, submission);
            return ResponseEntity.ok(new ResponseDTO(200, "Quiz submitted successfully", result));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @GetMapping("/{quizId}/answers")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseDTO> getStudentAnswers(
            @PathVariable Long courseId,
            @PathVariable Long quizId,
            @RequestParam Long userId) {
        try {
            List<StudentAnswerDTO> answers = quizService.getStudentAnswers(courseId, quizId, userId);
            return ResponseEntity.ok(new ResponseDTO(200, "Answers retrieved successfully", answers));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @GetMapping("/{quizId}/results")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseDTO> getQuizResult(
            @PathVariable Long courseId,
            @PathVariable Long quizId,
            @RequestParam Long userId) {
        try {
            QuizResult quizResult = quizResultRepo.findByQuizQuizIdAndUserUserId(quizId, userId)
                    .orElseThrow(() -> new RuntimeException("No quiz result found"));

            if (!quizResult.getQuiz().getCourse().getCourseId().equals(courseId)) {
                throw new RuntimeException("Quiz does not belong to this course");
            }

            QuizResultDTO result = new QuizResultDTO();
            result.setQuizId(quizResult.getQuiz().getQuizId());
            result.setScore(quizResult.getScore());
            result.setTotalMarks(quizResult.getTotalMarks());
            result.setCanRetake(!quizResult.isPassed());

            return ResponseEntity.ok(new ResponseDTO(200, "Result retrieved successfully", result));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }
}
