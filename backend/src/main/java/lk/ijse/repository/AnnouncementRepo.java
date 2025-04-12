package lk.ijse.repository;

import lk.ijse.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnouncementRepo extends JpaRepository<Announcement, Long> {

    List<Announcement> findByCourseCourseId(Long courseId);

    Optional<Announcement> findByAnnouncementIdAndCourseCourseId(Long announcementId, Long courseId);

}
