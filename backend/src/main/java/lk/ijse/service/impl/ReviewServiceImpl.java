package lk.ijse.service.impl;

import lk.ijse.dto.ReviewDTO;
import lk.ijse.entity.Course;
import lk.ijse.entity.Review;
import lk.ijse.entity.User;
import lk.ijse.repository.CourseRepo;
import lk.ijse.repository.ReviewRepo;
import lk.ijse.repository.UserRepo;
import lk.ijse.service.ReviewService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepo reviewRepo;

    @Autowired
    private CourseRepo courseRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    @Transactional
    public ReviewDTO addOrUpdateReview(Long courseId, ReviewDTO reviewDTO, String studentEmail) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        User student = userRepo.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Optional<Review> existingReview = reviewRepo.findByCourseCourseIdAndStudentId(courseId, student.getUserId());
        Review review;

        if (existingReview.isPresent()) {
            review = existingReview.get();
            review.setRating(reviewDTO.getRating());
            review.setComment(reviewDTO.getComment());
        } else {
            review = new Review();
            review.setCourse(course);
            review.setStudent(student);
            review.setRating(reviewDTO.getRating());
            review.setComment(reviewDTO.getComment());
            review.setCreatedAt(LocalDateTime.now());
        }

        reviewRepo.save(review);

        ReviewDTO responseDTO = modelMapper.map(review, ReviewDTO.class);
        responseDTO.setStudentName(student.getFullName());
        responseDTO.setStudentProfileImage(student.getProfilePicture());
        return responseDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO> getReviewsByCourseId(Long courseId) {
        List<Review> reviews = reviewRepo.findByCourseCourseId(courseId);
        return reviews.stream().map(review -> {
            ReviewDTO dto = modelMapper.map(review, ReviewDTO.class);
            dto.setStudentName(review.getStudent().getFullName());
            dto.setStudentProfileImage(review.getStudent().getProfilePicture());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageRating(Long courseId) {
        List<Review> reviews = reviewRepo.findByCourseCourseId(courseId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        double average = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        return Math.round(average * 10.0) / 10.0;
    }

    @Override
    @Transactional(readOnly = true)
    public Long getReviewCount(Long courseId) {
        return (long) reviewRepo.findByCourseCourseId(courseId).size();
    }

}
