package lk.ijse.service;

import lk.ijse.dto.QuizDTO;
import lk.ijse.dto.QuizResultDTO;
import lk.ijse.dto.QuizSubmissionDTO;
import lk.ijse.dto.StudentAnswerDTO;

import java.util.List;

public interface QuizService {

    QuizDTO addQuiz(Long courseId, QuizDTO quizDTO, String instructorEmail);

    QuizDTO updateQuiz(Long courseId, Long quizId, QuizDTO quizDTO, String instructorEmail);

    void deleteQuiz(Long courseId, Long quizId, String instructorEmail);

    List<QuizDTO> getQuizzesByCourseId(Long courseId);

    QuizDTO toggleQuizPublication(Long courseId, Long quizId, String instructorEmail);

    QuizResultDTO submitQuiz(Long courseId, QuizSubmissionDTO submission);

    List<StudentAnswerDTO> getStudentAnswers(Long courseId, Long quizId, Long userId);

}
