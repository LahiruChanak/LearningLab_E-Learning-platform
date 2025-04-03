package lk.ijse.service;

import lk.ijse.dto.LessonDTO;

import java.util.List;

public interface LessonService {

    List<LessonDTO> getLessonsByCourse(Long courseId);

    void updateLessonSequence(List<LessonDTO> lessonDTOs);

    LessonDTO createLesson(LessonDTO lessonDTO);

    LessonDTO updateLesson(Long lessonId, LessonDTO lessonDTO);

    void deleteLesson(Long lessonId);

}
