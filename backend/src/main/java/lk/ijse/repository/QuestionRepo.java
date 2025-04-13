package lk.ijse.repository;

import lk.ijse.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepo extends JpaRepository<Question, Long> {

    List<Question> findByQuizQuizId(Long quizId);

}
