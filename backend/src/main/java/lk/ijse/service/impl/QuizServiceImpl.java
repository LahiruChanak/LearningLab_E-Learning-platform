package lk.ijse.service.impl;

import lk.ijse.dto.*;
import lk.ijse.entity.*;
import lk.ijse.repository.*;
import lk.ijse.service.QuizService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizServiceImpl implements QuizService {

    @Autowired
    private QuizRepo quizRepo;

    @Autowired
    private QuestionRepo questionRepo;

    @Autowired
    private AnswerRepo answerRepo;

    @Autowired
    private CourseRepo courseRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private QuizResultRepo quizResultRepo;

    @Autowired
    private StudentAnswerRepo studentAnswerRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    @Transactional
    public QuizDTO addQuiz(Long courseId, QuizDTO quizDTO, String instructorEmail) {
        Course course = courseRepo.findByInstructorEmailAndCourseId(instructorEmail, courseId)
                .orElseThrow(() -> new RuntimeException("Course not found or you don’t have permission"));

        Quiz quiz = new Quiz();
        quiz.setCourse(course);
        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setTotalMarks(quizDTO.getTotalMarks());
        quiz.setPassingMarks(quizDTO.getPassingMarks());
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setUpdatedAt(LocalDateTime.now());
        quiz.setPublished(quizDTO.isPublished());

        List<Question> questions = new ArrayList<>();
        if (quizDTO.getQuestions() != null) {
            for (QuestionDTO qDTO : quizDTO.getQuestions()) {
                Question question = new Question();
                question.setQuiz(quiz);
                question.setQuestionText(qDTO.getQuestionText());

                List<Answer> answers = new ArrayList<>();
                if (qDTO.getAnswers() != null) {
                    for (AnswerDTO aDTO : qDTO.getAnswers()) {
                        Answer answer = new Answer();
                        answer.setQuestion(question);
                        answer.setAnswerText(aDTO.getAnswerText());
                        answer.setCorrect(aDTO.isCorrect());
                        answers.add(answer);
                    }
                }
                question.setAnswers(answers);
                questions.add(question);
            }
        }
        quiz.setQuestions(questions);

        quizRepo.save(quiz);
        return modelMapper.map(quiz, QuizDTO.class);
    }

    @Override
    @Transactional
    public QuizDTO updateQuiz(Long courseId, Long quizId, QuizDTO quizDTO, String instructorEmail) {
        Quiz quiz = quizRepo.findByQuizIdAndCourseCourseId(quizId, courseId)
                .orElseThrow(() -> new RuntimeException("Quiz not found or you don’t have permission"));

        if (!quiz.getCourse().getInstructor().getUser().getEmail().equals(instructorEmail)) {
            throw new RuntimeException("You don’t have permission to update this quiz");
        }

        // Update quiz fields
        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setTotalMarks(quizDTO.getTotalMarks());
        quiz.setPassingMarks(quizDTO.getPassingMarks());
        quiz.setUpdatedAt(LocalDateTime.now());

        // Map existing questions by ID
        Map<Long, Question> existingQuestions = quiz.getQuestions().stream()
                .filter(q -> q.getQuestionId() != null)
                .collect(Collectors.toMap(Question::getQuestionId, q -> q));

        // Track IDs of questions to keep
        List<Long> incomingQuestionIds = quizDTO.getQuestions() != null
                ? quizDTO.getQuestions().stream()
                .map(QuestionDTO::getQuestionId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList())
                : new ArrayList<>();

        // Delete questions not in the incoming DTO
        List<Question> questionsToDelete = existingQuestions.values().stream()
                .filter(q -> !incomingQuestionIds.contains(q.getQuestionId()))
                .collect(Collectors.toList());
        questionsToDelete.forEach(q -> {
            if (q.getAnswers() != null) {
                answerRepo.deleteAll(q.getAnswers()); // Delete associated answers
            }
            questionRepo.delete(q); // Delete question
        });

        // Update or add questions
        List<Question> updatedQuestions = new ArrayList<>();
        if (quizDTO.getQuestions() != null) {
            for (QuestionDTO qDTO : quizDTO.getQuestions()) {
                Question question;
                if (qDTO.getQuestionId() != null && existingQuestions.containsKey(qDTO.getQuestionId())) {
                    // Update existing question
                    question = existingQuestions.get(qDTO.getQuestionId());
                    question.setQuestionText(qDTO.getQuestionText());
                } else {
                    // New question
                    question = new Question();
                    question.setQuiz(quiz);
                    question.setQuestionText(qDTO.getQuestionText());
                    question.setAnswers(new ArrayList<>());
                }

                // Map existing answers by ID
                Map<Long, Answer> existingAnswers = question.getAnswers() != null
                        ? question.getAnswers().stream()
                        .filter(a -> a.getAnswerId() != null)
                        .collect(Collectors.toMap(Answer::getAnswerId, a -> a))
                        : Collections.emptyMap();

                // Track IDs of answers to keep
                List<Long> incomingAnswerIds = qDTO.getAnswers() != null
                        ? qDTO.getAnswers().stream()
                        .map(AnswerDTO::getAnswerId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList())
                        : new ArrayList<>();

                // Delete answers not in the incoming DTO
                List<Answer> answersToDelete = existingAnswers.values().stream()
                        .filter(a -> !incomingAnswerIds.contains(a.getAnswerId()))
                        .collect(Collectors.toList());
                answerRepo.deleteAll(answersToDelete);

                // Update or add answers
                List<Answer> updatedAnswers = new ArrayList<>();
                if (qDTO.getAnswers() != null) {
                    for (AnswerDTO aDTO : qDTO.getAnswers()) {
                        Answer answer;
                        if (aDTO.getAnswerId() != null && existingAnswers.containsKey(aDTO.getAnswerId())) {
                            // Update existing answer
                            answer = existingAnswers.get(aDTO.getAnswerId());
                            answer.setAnswerText(aDTO.getAnswerText());
                            answer.setCorrect(aDTO.isCorrect());
                        } else {
                            // New answer
                            answer = new Answer();
                            answer.setQuestion(question);
                            answer.setAnswerText(aDTO.getAnswerText());
                            answer.setCorrect(aDTO.isCorrect());
                        }
                        updatedAnswers.add(answer);
                    }
                }

                // Update answers collection
                question.getAnswers().clear();
                question.getAnswers().addAll(updatedAnswers);
                updatedQuestions.add(question);
            }
        }

        // Update questions collection
        quiz.getQuestions().clear();
        quiz.getQuestions().addAll(updatedQuestions);

        quizRepo.save(quiz);
        return modelMapper.map(quiz, QuizDTO.class);
    }

    @Override
    @Transactional
    public void deleteQuiz(Long courseId, Long quizId, String instructorEmail) {
        Quiz quiz = quizRepo.findByQuizIdAndCourseCourseId(quizId, courseId)
                .orElseThrow(() -> new RuntimeException("Quiz not found or you don’t have permission"));

        if (!quiz.getCourse().getInstructor().getUser().getEmail().equals(instructorEmail)) {
            throw new RuntimeException("You don’t have permission to delete this quiz");
        }

        quizRepo.delete(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizzesByCourseId(Long courseId) {
        List<Quiz> quizzes = quizRepo.findByCourseCourseId(courseId);
        return quizzes.stream()
                .map(quiz -> modelMapper.map(quiz, QuizDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuizDTO toggleQuizPublication(Long courseId, Long quizId, String instructorEmail) {
        Quiz quiz = quizRepo.findByQuizIdAndCourseCourseId(quizId, courseId)
                .orElseThrow(() -> new RuntimeException("Quiz not found or you don’t have permission"));

        if (!quiz.getCourse().getInstructor().getUser().getEmail().equals(instructorEmail)) {
            throw new RuntimeException("You don’t have permission to modify this quiz");
        }

        quiz.setPublished(!quiz.isPublished());
        quiz.setUpdatedAt(LocalDateTime.now());
        quizRepo.save(quiz);
        return modelMapper.map(quiz, QuizDTO.class);
    }

    @Override
    @Transactional
    public QuizResultDTO submitQuiz(Long courseId, QuizSubmissionDTO submission) {
        Quiz quiz = quizRepo.findById(submission.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (!quiz.getCourse().getCourseId().equals(courseId)) {
            throw new RuntimeException("Quiz does not belong to this course");
        }

        if (!quiz.isPublished()) {
            throw new RuntimeException("Quiz is not published");
        }

        User user = userRepo.findById(submission.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getRole().equals(User.Role.STUDENT)) {
            throw new RuntimeException("Only students can submit quizzes");
        }

        // Calculate score
        int score = 0;
        int totalMarks = quiz.getTotalMarks();
        int marksPerQuestion = totalMarks / quiz.getQuestions().size();

        for (AnswerSubmissionDTO answerSubmission : submission.getAnswers()) {
            Answer answer = answerRepo.findById(answerSubmission.getAnswerId())
                    .orElseThrow(() -> new RuntimeException("Answer not found for question ID: " + answerSubmission.getQuestionId()));
            if (answer.isCorrect()) {
                score += marksPerQuestion;
            }
        }

        // Determine retake eligibility (score < 60%)
        double scorePercentage = ((double) score / totalMarks) * 100;
        boolean passed = scorePercentage >= 60;
        boolean canRetake = !passed;

        // Save results and answers if not previously saved
        if (!quizResultRepo.existsByQuizQuizIdAndUserUserId(quiz.getQuizId(), submission.getUserId())) {
            QuizResult quizResult = new QuizResult();
            quizResult.setQuiz(quiz);
            quizResult.setUser(user);
            quizResult.setScore(score);
            quizResult.setTotalMarks(totalMarks);
            quizResult.setPassed(passed);
            quizResult.setCompletedAt(LocalDateTime.now());
            quizResultRepo.save(quizResult);

            // Save each selected answer
            for (AnswerSubmissionDTO answerSubmission : submission.getAnswers()) {
                Question question = questionRepo.findById(answerSubmission.getQuestionId())
                        .orElseThrow(() -> new RuntimeException("Question not found"));
                Answer answer = answerRepo.findById(answerSubmission.getAnswerId())
                        .orElseThrow(() -> new RuntimeException("Answer not found"));
                StudentAnswer studentAnswer = new StudentAnswer();
                studentAnswer.setQuizResult(quizResult);
                studentAnswer.setQuestion(question);
                studentAnswer.setSelectedAnswer(answer);
                studentAnswerRepo.save(studentAnswer);
            }
        }

        // Build result
        QuizResultDTO result = new QuizResultDTO();
        result.setQuizId(quiz.getQuizId());
        result.setScore(score);
        result.setTotalMarks(totalMarks);
        result.setCanRetake(canRetake);

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentAnswerDTO> getStudentAnswers(Long courseId, Long quizId, Long userId) {
        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (!quiz.getCourse().getCourseId().equals(courseId)) {
            throw new RuntimeException("Quiz does not belong to this course");
        }

        userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<StudentAnswer> studentAnswers = studentAnswerRepo.findByQuizResultQuizQuizIdAndQuizResultUserUserId(quizId, userId);

        // Remove the condition that checks for pass status
        if (studentAnswers.isEmpty()) {
            return List.of(); // No answers submitted yet
        }

        return studentAnswers.stream().map(sa -> {
            StudentAnswerDTO dto = new StudentAnswerDTO();
            dto.setQuestionId(sa.getQuestion().getQuestionId());
            dto.setQuestionText(sa.getQuestion().getQuestionText());
            dto.setSelectedAnswerId(sa.getSelectedAnswer().getAnswerId());
            dto.setSelectedAnswerText(sa.getSelectedAnswer().getAnswerText());
            dto.setCorrect(sa.getSelectedAnswer().isCorrect());
            return dto;
        }).collect(Collectors.toList());
    }
}
