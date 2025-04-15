package lk.ijse.service.impl;

import lk.ijse.dto.ScheduleDTO;
import lk.ijse.entity.Course;
import lk.ijse.entity.Schedule;
import lk.ijse.repository.CourseRepo;
import lk.ijse.repository.ScheduleRepo;
import lk.ijse.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleServiceImpl implements ScheduleService {

    @Autowired
    private ScheduleRepo scheduleRepo;

    @Autowired
    private CourseRepo courseRepo;

    @Override
    public ScheduleDTO createSchedule(ScheduleDTO scheduleDTO) {
        Schedule schedule = mapToEntity(scheduleDTO);
        schedule = scheduleRepo.save(schedule);
        handleRecurrence(schedule);
        return mapToDTO(schedule);
    }

    @Override
    public ScheduleDTO updateSchedule(Long id, ScheduleDTO scheduleDTO) {
        Schedule schedule = scheduleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        updateScheduleFromDTO(schedule, scheduleDTO);
        schedule = scheduleRepo.save(schedule);
        return mapToDTO(schedule);
    }

    @Override
    public void deleteSchedule(Long id) {
        scheduleRepo.deleteById(id);
    }

    @Override
    public ScheduleDTO getSchedule(Long id) {
        Schedule schedule = scheduleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        return mapToDTO(schedule);
    }

    @Override
    public List<ScheduleDTO> getSchedulesByCourseAndDateRange(Long courseId,
                                                              LocalDateTime start, LocalDateTime end) {
        return scheduleRepo.findByCourseCourseIdAndStartTimeBetween(courseId, start, end)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ScheduleDTO> getAllSchedulesByCourse(Long courseId) {
        return scheduleRepo.findByCourseCourseId(courseId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ScheduleDTO> getAllSchedules() {
        return scheduleRepo.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private Schedule mapToEntity(ScheduleDTO dto) {
        Schedule schedule = new Schedule();
        Course course = courseRepo.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        schedule.setCourse(course);
        schedule.setTitle(dto.getTitle());
        schedule.setDescription(dto.getDescription());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setEventType(Schedule.EventType.valueOf(dto.getEventType().toUpperCase()));
        schedule.setRecurrence(Schedule.Recurrence.valueOf(dto.getRecurrence().toUpperCase()));
        return schedule;
    }

    private ScheduleDTO mapToDTO(Schedule schedule) {
        ScheduleDTO dto = new ScheduleDTO();
        dto.setScheduleId(schedule.getScheduleId());
        dto.setCourseId(schedule.getCourse().getCourseId());
        dto.setTitle(schedule.getTitle());
        dto.setDescription(schedule.getDescription());
        dto.setStartTime(schedule.getStartTime());
        dto.setEndTime(schedule.getEndTime());
        dto.setEventType(schedule.getEventType().name().toLowerCase());
        dto.setRecurrence(schedule.getRecurrence().name().toLowerCase());
        return dto;
    }

    private void updateScheduleFromDTO(Schedule schedule, ScheduleDTO dto) {
        Course course = courseRepo.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        schedule.setCourse(course);
        schedule.setTitle(dto.getTitle());
        schedule.setDescription(dto.getDescription());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setEventType(Schedule.EventType.valueOf(dto.getEventType().toUpperCase()));
        schedule.setRecurrence(Schedule.Recurrence.valueOf(dto.getRecurrence().toUpperCase()));
    }

    private void handleRecurrence(Schedule schedule) {
        if (schedule.getRecurrence() == Schedule.Recurrence.NONE) return;

        LocalDateTime baseTime = schedule.getStartTime();
        Duration duration = Duration.between(schedule.getStartTime(), schedule.getEndTime());
        int intervalDays;
        switch (schedule.getRecurrence()) {
            case WEEKLY:
                intervalDays = 7;
                break;
            case BIWEEKLY:
                intervalDays = 14;
                break;
            case MONTHLY:
                intervalDays = 30;
                break;
            default:
                return;
        }

        for (int i = 1; i <= 4; i++) {
            Schedule recurring = new Schedule();
            recurring.setCourse(schedule.getCourse());
            recurring.setTitle(schedule.getTitle());
            recurring.setDescription(schedule.getDescription());
            recurring.setEventType(schedule.getEventType());
            recurring.setRecurrence(schedule.getRecurrence());

            LocalDateTime newStart = schedule.getRecurrence() == Schedule.Recurrence.MONTHLY
                    ? baseTime.plusMonths(i)
                    : baseTime.plusDays((long) i * intervalDays);
            recurring.setStartTime(newStart);
            recurring.setEndTime(newStart.plus(duration));

            scheduleRepo.save(recurring);
        }
    }
}
