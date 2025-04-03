package lk.ijse.repository;

import lk.ijse.entity.LessonVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonVideoRepo extends JpaRepository<LessonVideo, Long> {
}
