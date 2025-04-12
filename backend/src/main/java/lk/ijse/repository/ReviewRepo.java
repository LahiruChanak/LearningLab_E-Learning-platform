package lk.ijse.repository;

import lk.ijse.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepo extends JpaRepository<Review, Long> {

    List<Review> findByCourseCourseId(Long courseId);

    @Query("SELECT r FROM Review r WHERE r.course.courseId = :courseId AND r.student.userId = :studentId")
    Optional<Review> findByCourseCourseIdAndStudentId(@Param("courseId") Long courseId, @Param("studentId") Long studentId);

}
