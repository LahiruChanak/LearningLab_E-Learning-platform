package lk.ijse.controller;

import lk.ijse.dto.ResponseDTO;
import lk.ijse.dto.ReviewDTO;
import lk.ijse.repository.ReviewRepo;
import lk.ijse.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/course/{courseId}/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private ReviewRepo reviewRepo;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseDTO> addOrUpdateReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @RequestBody ReviewDTO reviewDTO) {
        try {
            ReviewDTO savedReview = reviewService.addOrUpdateReview(courseId, reviewDTO, userDetails.getUsername());
            String message = reviewRepo.findByCourseCourseIdAndStudentId(courseId, savedReview.getStudentId()).isPresent() ?
                    "Review updated successfully" : "Review added successfully";
            return ResponseEntity.ok(new ResponseDTO(200, message, savedReview));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ResponseDTO> getReviews(@PathVariable Long courseId) {
        try {
            List<ReviewDTO> reviews = reviewService.getReviewsByCourseId(courseId);
            return ResponseEntity.ok(new ResponseDTO(200, "Reviews retrieved successfully", reviews));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<ResponseDTO> getReviewStats(@PathVariable Long courseId) {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("averageRating", reviewService.getAverageRating(courseId));
            stats.put("reviewCount", reviewService.getReviewCount(courseId));
            return ResponseEntity.ok(new ResponseDTO(200, "Review stats retrieved successfully", stats));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

}
