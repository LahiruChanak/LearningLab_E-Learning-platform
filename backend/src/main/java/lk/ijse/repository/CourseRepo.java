package lk.ijse.repository;

import lk.ijse.entity.Category;
import lk.ijse.entity.Course;
import lk.ijse.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CourseRepo extends JpaRepository<Course, Long> {

    List<Course> findByCategory(Category category);

    // this query is used to find courses to each instructor email
    @Query("SELECT c FROM Course c WHERE c.instructor.user.email = :email AND c.courseId = :courseId")
    Optional<Course> findByInstructorEmailAndCourseId(String email, Long courseId);

    List<Course> findByInstructor(Instructor instructor);

}
