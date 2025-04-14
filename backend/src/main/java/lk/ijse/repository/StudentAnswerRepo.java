package lk.ijse.repository;

import lk.ijse.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAnswerRepo extends JpaRepository<StudentAnswer, Long> {

    List<StudentAnswer> findByQuizResultQuizQuizIdAndQuizResultUserUserId(Long quizId, Long userId);

}
