package lk.ijse.repository;

import lk.ijse.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepo extends JpaRepository<Quiz, Long> {

    List<Quiz> findByCourseCourseId(Long courseId);

    Optional<Quiz> findByQuizIdAndCourseCourseId(Long quizId, Long courseId);

}
