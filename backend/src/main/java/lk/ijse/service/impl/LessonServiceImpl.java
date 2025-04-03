package lk.ijse.service.impl;

import lk.ijse.dto.LessonDTO;
import lk.ijse.entity.Course;
import lk.ijse.entity.Lesson;
import lk.ijse.entity.LessonVideo;
import lk.ijse.repository.CourseRepo;
import lk.ijse.repository.LessonRepo;
import lk.ijse.repository.LessonVideoRepo;
import lk.ijse.service.LessonService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LessonServiceImpl implements LessonService {
    @Autowired
    private LessonRepo lessonRepo;

    @Autowired
    private CourseRepo courseRepo;

    @Autowired
    private LessonVideoRepo lessonVideoRepo;

    @Autowired
    private ModelMapper modelMapper;

    public List<LessonDTO> getLessonsByCourse(Long courseId) {
        List<Lesson> lessons = lessonRepo.findByCourseCourseId(courseId);
        return lessons.stream()
                .map(lesson -> modelMapper.map(lesson, LessonDTO.class))
                .collect(Collectors.toList());
    }

    public LessonDTO createLesson(LessonDTO lessonDTO) {
        Course course = courseRepo.findById(lessonDTO.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        Lesson lesson = modelMapper.map(lessonDTO, Lesson.class);
        lesson.setCourse(course);
        if (lessonDTO.getVideos() != null) {
            List<LessonVideo> videos = lessonDTO.getVideos().stream()
                    .map(videoDTO -> {
                        LessonVideo video = modelMapper.map(videoDTO, LessonVideo.class);
                        video.setLesson(lesson);
                        return video;
                    })
                    .collect(Collectors.toList());
            lesson.setVideos(videos);
        }
        Lesson savedLesson = lessonRepo.save(lesson);
        return modelMapper.map(savedLesson, LessonDTO.class);
    }

    public LessonDTO updateLesson(Long lessonId, LessonDTO lessonDTO) {
        Lesson lesson = lessonRepo.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        lesson.setTitle(lessonDTO.getTitle());
        lesson.setIsPublished(lessonDTO.getIsPublished());

        // Update videos
        lesson.getVideos().clear();
        if (lessonDTO.getVideos() != null) {
            List<LessonVideo> videos = lessonDTO.getVideos().stream()
                    .map(videoDTO -> {
                        LessonVideo video = modelMapper.map(videoDTO, LessonVideo.class);
                        video.setLesson(lesson);
                        return video;
                    })
                    .collect(Collectors.toList());
            lesson.setVideos(videos);
        }

        Lesson updatedLesson = lessonRepo.save(lesson);
        return modelMapper.map(updatedLesson, LessonDTO.class);
    }

    public void deleteLesson(Long lessonId) {
        Lesson lesson = lessonRepo.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        lessonRepo.delete(lesson);
    }

    public void updateLessonSequence(List<LessonDTO> lessonDTOs) {
        for (LessonDTO dto : lessonDTOs) {
            Lesson lesson = lessonRepo.findById(dto.getLessonId())
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));
            lesson.setLessonSequence(dto.getLessonSequence());
            lessonRepo.save(lesson);
        }
    }
}
