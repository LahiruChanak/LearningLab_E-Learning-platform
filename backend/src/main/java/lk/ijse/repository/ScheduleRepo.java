package lk.ijse.repository;

import lk.ijse.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface ScheduleRepo extends JpaRepository<Schedule, Long> {

    List<Schedule> findByCourseCourseIdAndStartTimeBetween(Long courseId, LocalDateTime start, LocalDateTime end);

    List<Schedule> findByCourseCourseId(Long courseId);

}
