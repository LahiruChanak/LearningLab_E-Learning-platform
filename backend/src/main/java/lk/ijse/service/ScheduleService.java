package lk.ijse.service;

import lk.ijse.dto.ScheduleDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface ScheduleService {

    ScheduleDTO createSchedule(ScheduleDTO scheduleDTO);

    ScheduleDTO updateSchedule(Long id, ScheduleDTO scheduleDTO);

    void deleteSchedule(Long id);

    ScheduleDTO getSchedule(Long id);

    List<ScheduleDTO> getSchedulesByCourseAndDateRange(Long courseId, LocalDateTime start, LocalDateTime end);

    List<ScheduleDTO> getAllSchedulesByCourse(Long courseId);

    List<ScheduleDTO> getAllSchedules();

}
