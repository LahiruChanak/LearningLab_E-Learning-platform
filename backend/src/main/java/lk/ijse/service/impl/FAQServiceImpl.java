package lk.ijse.service.impl;

import lk.ijse.dto.FAQDTO;
import lk.ijse.entity.Course;
import lk.ijse.entity.FAQ;
import lk.ijse.entity.User;
import lk.ijse.repository.CourseRepo;
import lk.ijse.repository.FAQRepo;
import lk.ijse.repository.UserRepo;
import lk.ijse.service.FAQService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FAQServiceImpl implements FAQService {

    @Autowired
    private FAQRepo faqRepo;

    @Autowired
    private CourseRepo courseRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    @Transactional
    public FAQDTO addFAQ(Long courseId, FAQDTO faqDTO, String instructorEmail) {
        Course course = courseRepo.findByInstructorEmailAndCourseId(instructorEmail, courseId)
                .orElseThrow(() -> new RuntimeException("Course not found or you don’t have permission"));

        FAQ faq = new FAQ();
        faq.setCourse(course);
        faq.setQuestion(faqDTO.getQuestion());
        faq.setAnswer(faqDTO.getAnswer());
        faq.setCreatedAt(LocalDateTime.now());

        faqRepo.save(faq);
        return modelMapper.map(faq, FAQDTO.class);
    }

    @Override
    @Transactional
    public FAQDTO updateFAQ(Long courseId, Long faqId, FAQDTO faqDTO, String instructorEmail) {
        FAQ faq = faqRepo.findByFaqIdAndCourseCourseId(faqId, courseId)
                .orElseThrow(() -> new RuntimeException("FAQ not found or you don’t have permission"));

        if (!faq.getCourse().getInstructor().getUser().getEmail().equals(instructorEmail)) {
            throw new RuntimeException("You don’t have permission to update this FAQ");
        }

        if (faqDTO.getQuestion() != null && !faqDTO.getQuestion().isEmpty()) {
            faq.setQuestion(faqDTO.getQuestion());
        }

        faq.setAnswer(faqDTO.getAnswer());

        faqRepo.save(faq);
        return modelMapper.map(faq, FAQDTO.class);
    }

    @Override
    @Transactional
    public void deleteFAQ(Long courseId, Long faqId, String instructorEmail) {
        FAQ faq = faqRepo.findByFaqIdAndCourseCourseId(faqId, courseId)
                .orElseThrow(() -> new RuntimeException("FAQ not found or you don’t have permission"));

        if (!faq.getCourse().getInstructor().getUser().getEmail().equals(instructorEmail)) {
            throw new RuntimeException("You don’t have permission to delete this FAQ");
        }

        faqRepo.delete(faq);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FAQDTO> getFAQsByCourseId(Long courseId) {
        List<FAQ> faqs = faqRepo.findByCourseCourseIdOrderByCreatedAtDesc(courseId);
        return faqs.stream()
                .map(faq -> modelMapper.map(faq, FAQDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FAQDTO submitQuestion(Long courseId, FAQDTO faqDTO, String studentEmail) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        User student = userRepo.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        FAQ faq = new FAQ();
        faq.setCourse(course);
        faq.setQuestion(faqDTO.getQuestion());
        faq.setAnswer(null);
        faq.setCreatedAt(LocalDateTime.now());

        faqRepo.save(faq);
        return modelMapper.map(faq, FAQDTO.class);
    }
}
