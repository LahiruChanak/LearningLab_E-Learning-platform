package lk.ijse.service;

import lk.ijse.dto.AnnouncementDTO;

import java.util.List;

public interface AnnouncementService {

    AnnouncementDTO addAnnouncement(Long courseId, AnnouncementDTO announcementDTO, String instructorEmail);

    AnnouncementDTO updateAnnouncement(Long courseId, Long announcementId, AnnouncementDTO announcementDTO, String instructorEmail);

    void deleteAnnouncement(Long courseId, Long announcementId, String instructorEmail);

    List<AnnouncementDTO> getAnnouncementsByCourseId(Long courseId);

}