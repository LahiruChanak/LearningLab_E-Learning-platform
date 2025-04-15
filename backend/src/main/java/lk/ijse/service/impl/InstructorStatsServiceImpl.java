package lk.ijse.service.impl;

import lk.ijse.dto.InstructorStatsDTO;
import lk.ijse.entity.Course;
import lk.ijse.entity.Instructor;
import lk.ijse.entity.User;
import lk.ijse.repository.*;
import lk.ijse.service.InstructorStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InstructorStatsServiceImpl implements InstructorStatsService {

    @Autowired
    private InstructorRepo instructorRepo;

    @Autowired
    private CourseRepo courseRepo;

    @Autowired
    private EnrollmentRepo enrollmentRepo;

    @Autowired
    private ReviewRepo reviewRepo;

    @Autowired
    private UserRepo userRepo;

    @Override
    public InstructorStatsDTO getInstructorStats(String instructorEmail) {
        User user = userRepo.findByEmail(instructorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Instructor instructor = instructorRepo.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        List<Course> courses = courseRepo.findByInstructor(instructor);

        // Student Count
        long studentCount = enrollmentRepo.countByCourseIn(courses);

        // Total Earnings
        double totalEarnings = courses.stream()
                .mapToDouble(Course::getPrice)
                .sum();

        // Average Rating
        Double averageRating = reviewRepo.calculateAverageRatingByCourses(courses);
        double finalAverageRating = averageRating != null ? averageRating : 0.0;

        return new InstructorStatsDTO(studentCount, totalEarnings, finalAverageRating);
    }
}
