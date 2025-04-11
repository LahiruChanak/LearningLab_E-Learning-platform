package lk.ijse.service;

import lk.ijse.dto.EnrollmentDTO;
import lk.ijse.entity.Enrollment;

import java.util.Optional;

public interface EnrollmentService {

    Optional<Enrollment> getEnrollment(Long studentId, Long courseId);

    EnrollmentDTO enrollStudent(Long studentId, Long courseId);

    EnrollmentDTO updateCompletedVideos(Long enrollmentId, Long videoId);

}
