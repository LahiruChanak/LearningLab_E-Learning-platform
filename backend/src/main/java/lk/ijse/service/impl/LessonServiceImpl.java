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
import java.util.Map;
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

    @Override
    public LessonDTO createLesson(LessonDTO lessonDTO) {
        Course course = courseRepo.findById(lessonDTO.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + lessonDTO.getCourseId()));

        Lesson lesson = new Lesson();
        lesson.setCourse(course);
        lesson.setTitle(lessonDTO.getTitle());
        lesson.setIsPublished(lessonDTO.getIsPublished());
        lesson.setLessonSequence(lessonDTO.getLessonSequence() != null ? lessonDTO.getLessonSequence() : getNextSequence(course.getCourseId()));

        if (lessonDTO.getVideos() != null && !lessonDTO.getVideos().isEmpty()) {
            List<LessonVideo> videos = lessonDTO.getVideos().stream()
                    .map(videoDTO -> {
                        LessonVideo video = new LessonVideo();
                        video.setLesson(lesson);
                        video.setVideoUrl(videoDTO.getVideoUrl());
                        video.setTitle(videoDTO.getTitle());
                        video.setDuration(videoDTO.getDuration());
                        video.setVideoSequence(videoDTO.getVideoSequence());
                        return video;
                    })
                    .collect(Collectors.toList());
            lesson.setVideos(videos);
        }

        Lesson savedLesson = lessonRepo.save(lesson);
        return modelMapper.map(savedLesson, LessonDTO.class);
    }

    @Override
    public LessonDTO updateLesson(Long lessonId, LessonDTO lessonDTO) {
        Lesson lesson = lessonRepo.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with ID: " + lessonId));

        lesson.setTitle(lessonDTO.getTitle());
        lesson.setIsPublished(lessonDTO.getIsPublished());
        lesson.setLessonSequence(lessonDTO.getLessonSequence() != null ? lessonDTO.getLessonSequence() : lesson.getLessonSequence());

        // update existing, add new, remove deleted
        List<LessonVideo> existingVideos = lesson.getVideos();
        Map<Long, LessonVideo> existingVideoMap = existingVideos.stream()
                .collect(Collectors.toMap(LessonVideo::getVideoId, video -> video));

        List<LessonVideo> updatedVideos = lessonDTO.getVideos() != null ? lessonDTO.getVideos().stream()
                .map(videoDTO -> {
                    LessonVideo video;
                    if (videoDTO.getVideoId() != null && existingVideoMap.containsKey(videoDTO.getVideoId())) {
                        video = existingVideoMap.get(videoDTO.getVideoId());
                        video.setVideoUrl(videoDTO.getVideoUrl());
                        video.setTitle(videoDTO.getTitle());
                        video.setDuration(videoDTO.getDuration());
                        video.setVideoSequence(videoDTO.getVideoSequence());
                    } else {
                        video = new LessonVideo();
                        video.setLesson(lesson);
                        video.setVideoUrl(videoDTO.getVideoUrl());
                        video.setTitle(videoDTO.getTitle());
                        video.setDuration(videoDTO.getDuration());
                        video.setVideoSequence(videoDTO.getVideoSequence());
                    }
                    return video;
                })
                .collect(Collectors.toList()) : List.of();

        // remove videos not in the updated list
        existingVideos.removeIf(video -> !updatedVideos.stream().anyMatch(uv -> uv.getVideoId() != null && uv.getVideoId().equals(video.getVideoId())));
        // Add new or updated videos
        updatedVideos.forEach(video -> {
            if (!existingVideos.contains(video)) {
                existingVideos.add(video);
            }
        });

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

    private Integer getNextSequence(Long courseId) {
        List<Lesson> lessons = lessonRepo.findByCourseCourseId(courseId);
        return lessons.stream()
                .map(Lesson::getLessonSequence)
                .filter(seq -> seq != null)
                .max(Integer::compare)
                .map(max -> max + 1)
                .orElse(1);
    }
}
