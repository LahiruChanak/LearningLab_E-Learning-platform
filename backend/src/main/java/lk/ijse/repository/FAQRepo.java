package lk.ijse.repository;

import lk.ijse.entity.FAQ;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FAQRepo extends JpaRepository<FAQ, Long> {

    List<FAQ> findByCourseCourseIdOrderByCreatedAtDesc(Long courseId);

    Optional<FAQ> findByFaqIdAndCourseCourseId(Long faqId, Long courseId);

}
