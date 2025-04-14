package lk.ijse.repository;

import lk.ijse.entity.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizResultRepo extends JpaRepository<QuizResult, Long> {

    boolean existsByQuizQuizIdAndUserUserId(Long quizId, Long userId);

    Optional<QuizResult> findByQuizQuizIdAndUserUserId(Long quizId, Long userId);

}
