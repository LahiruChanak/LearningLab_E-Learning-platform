package lk.ijse.repository;

import lk.ijse.entity.Course;
import lk.ijse.entity.Enrollment;
import lk.ijse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepo extends JpaRepository<Enrollment, Long> {

    @Query("SELECT e FROM Enrollment e WHERE e.student.userId = :studentId AND e.course.courseId = :courseId")
    Optional<Enrollment> findByStudentIdAndCourseId(@Param("studentId") Long studentId, @Param("courseId") Long courseId);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course IN :courses")
    long countByCourseIn(List<Course> courses);

    List<Enrollment> findByStudent(User student);

}
