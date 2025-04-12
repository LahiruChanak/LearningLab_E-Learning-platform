package lk.ijse.service;

import lk.ijse.dto.FAQDTO;

import java.util.List;

public interface FAQService {

    FAQDTO addFAQ(Long courseId, FAQDTO faqDTO, String userEmail);

    FAQDTO updateFAQ(Long courseId, Long faqId, FAQDTO faqDTO, String instructorEmail);

    void deleteFAQ(Long courseId, Long faqId, String instructorEmail);

    List<FAQDTO> getFAQsByCourseId(Long courseId);

    FAQDTO submitQuestion(Long courseId, FAQDTO faqDTO, String studentEmail);

}
