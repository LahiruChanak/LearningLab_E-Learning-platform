package lk.ijse.repository;

import lk.ijse.entity.Category;
import lk.ijse.entity.Course;
import lk.ijse.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepo extends JpaRepository<Course, Long> {

    List<Course> findByCategory(Category category);

    List<Course> findByIsPublishedTrue();

    int countByInstructorUserUserId(Long userId);

    List<Course> findByInstructor(Instructor instructor);

    @Query("SELECT c FROM Course c WHERE c.instructor.user.email = :email AND c.courseId = :courseId")
    Optional<Course> findByInstructorEmailAndCourseId(String email, Long courseId);

    @Query("SELECT c FROM Course c WHERE c.instructor.user.email = :email " +
            "AND (:categoryId IS NULL OR c.category.categoryId = :categoryId) " +
            "AND (:level IS NULL OR c.level = :level) " +
            "AND (:isPublished IS NULL OR c.isPublished = :isPublished) " +
            "AND (:title IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :title, '%')))")
    List<Course> findCoursesByFilters(
            @Param("email") String email,
            @Param("categoryId") Long categoryId,
            @Param("level") String level,
            @Param("isPublished") Boolean isPublished,
            @Param("title") String title);

}
