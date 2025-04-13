package lk.ijse.service;

import lk.ijse.dto.QuizDTO;

import java.util.List;

public interface QuizService {

    QuizDTO addQuiz(Long courseId, QuizDTO quizDTO, String instructorEmail);

    QuizDTO updateQuiz(Long courseId, Long quizId, QuizDTO quizDTO, String instructorEmail);

    void deleteQuiz(Long courseId, Long quizId, String instructorEmail);

    List<QuizDTO> getQuizzesByCourseId(Long courseId);

    QuizDTO toggleQuizPublication(Long courseId, Long quizId, String instructorEmail);

}
