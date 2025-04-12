package lk.ijse.service;

import lk.ijse.dto.ReviewDTO;

import java.util.List;

public interface ReviewService {

    ReviewDTO addOrUpdateReview(Long courseId, ReviewDTO reviewDTO, String studentEmail);

    List<ReviewDTO> getReviewsByCourseId(Long courseId);

    Double getAverageRating(Long courseId);

    Long getReviewCount(Long courseId);

}
