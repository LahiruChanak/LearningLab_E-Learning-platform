package lk.ijse.service.impl;

import lk.ijse.dto.AnnouncementDTO;
import lk.ijse.entity.Announcement;
import lk.ijse.entity.Course;
import lk.ijse.repository.AnnouncementRepo;
import lk.ijse.repository.CourseRepo;
import lk.ijse.service.AnnouncementService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnnouncementServiceImpl implements AnnouncementService {

    @Autowired
    private AnnouncementRepo announcementRepo;

    @Autowired
    private CourseRepo courseRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    @Transactional
    public AnnouncementDTO addAnnouncement(Long courseId, AnnouncementDTO announcementDTO, String instructorEmail) {
        Course course = courseRepo.findByInstructorEmailAndCourseId(instructorEmail, courseId)
                .orElseThrow(() -> new RuntimeException("Course not found or you don’t have permission"));

        Announcement announcement = new Announcement();
        announcement.setCourse(course);
        announcement.setTitle(announcementDTO.getTitle());
        announcement.setDescription(announcementDTO.getDescription());
        announcement.setDate(LocalDateTime.now());

        announcementRepo.save(announcement);
        return modelMapper.map(announcement, AnnouncementDTO.class);
    }

    @Override
    @Transactional
    public AnnouncementDTO updateAnnouncement(Long courseId, Long announcementId, AnnouncementDTO announcementDTO, String instructorEmail) {
        Announcement announcement = announcementRepo.findByAnnouncementIdAndCourseCourseId(announcementId, courseId)
                .orElseThrow(() -> new RuntimeException("Announcement not found or you don’t have permission"));

        if (!announcement.getCourse().getInstructor().getUser().getEmail().equals(instructorEmail)) {
            throw new RuntimeException("You don’t have permission to update this announcement");
        }

        if (announcementDTO.getTitle() != null) {
            announcement.setTitle(announcementDTO.getTitle());
        }
        if (announcementDTO.getDescription() != null) {
            announcement.setDescription(announcementDTO.getDescription());
        }
        // Date remains unchanged to preserve original timestamp

        announcementRepo.save(announcement);
        return modelMapper.map(announcement, AnnouncementDTO.class);
    }

    @Override
    @Transactional
    public void deleteAnnouncement(Long courseId, Long announcementId, String instructorEmail) {
        Announcement announcement = announcementRepo.findByAnnouncementIdAndCourseCourseId(announcementId, courseId)
                .orElseThrow(() -> new RuntimeException("Announcement not found or you don’t have permission"));

        if (!announcement.getCourse().getInstructor().getUser().getEmail().equals(instructorEmail)) {
            throw new RuntimeException("You don’t have permission to delete this announcement");
        }

        announcementRepo.delete(announcement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementDTO> getAnnouncementsByCourseId(Long courseId) {
        List<Announcement> announcements = announcementRepo.findByCourseCourseId(courseId);
        return announcements.stream()
                .map(announcement -> modelMapper.map(announcement, AnnouncementDTO.class))
                .collect(Collectors.toList());
    }

}
