package lk.ijse.service.impl;

import lk.ijse.dto.EnrollmentDTO;
import lk.ijse.entity.Course;
import lk.ijse.entity.Enrollment;
import lk.ijse.entity.User;
import lk.ijse.repository.CourseRepo;
import lk.ijse.repository.EnrollmentRepo;
import lk.ijse.repository.UserRepo;
import lk.ijse.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;

@Service
public class EnrollmentServiceImpl implements EnrollmentService {

    @Autowired
    private EnrollmentRepo enrollmentRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private CourseRepo courseRepo;

    @Override
    public Optional<Enrollment> getEnrollment(Long studentId, Long courseId) {
        return enrollmentRepo.findByStudentIdAndCourseId(studentId, courseId);
    }

    @Override
    @Transactional
    public EnrollmentDTO enrollStudent(Long studentId, Long courseId) {

        Optional<Enrollment> existingEnrollment = enrollmentRepo.findByStudentIdAndCourseId(studentId, courseId);
        if (existingEnrollment.isPresent()) {
            throw new IllegalStateException("Student is already enrolled in this course");
        }

        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setEnrollmentDate(LocalDateTime.now());
        enrollment.setCompletedVideoIds(new HashSet<>());

        Enrollment savedEnrollment = enrollmentRepo.save(enrollment);

        return mapToDto(savedEnrollment);
    }

    @Override
    @Transactional
    public EnrollmentDTO updateCompletedVideos(Long enrollmentId, Long videoId) {
        Enrollment enrollment = enrollmentRepo.findById(enrollmentId)
                .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));

        enrollment.getCompletedVideoIds().add(videoId);

        Enrollment updatedEnrollment = enrollmentRepo.save(enrollment);

        return mapToDto(updatedEnrollment);
    }

    private EnrollmentDTO mapToDto(Enrollment enrollment) {
        EnrollmentDTO dto = new EnrollmentDTO();
        dto.setEnrollmentId(enrollment.getEnrollmentId());
        dto.setStudentId(enrollment.getStudent().getUserId());
        dto.setCourseId(enrollment.getCourse().getCourseId());
        dto.setEnrollmentDate(enrollment.getEnrollmentDate());
        dto.setCompletedVideoIds(enrollment.getCompletedVideoIds());

        return dto;
    }

}
