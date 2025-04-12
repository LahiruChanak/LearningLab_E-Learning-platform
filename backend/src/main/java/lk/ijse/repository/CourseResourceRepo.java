package lk.ijse.repository;

import lk.ijse.entity.CourseResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseResourceRepo extends JpaRepository<CourseResource, Long> {

    List<CourseResource> findByCourseCourseId(Long courseId);

    Optional<CourseResource> findByResourceIdAndCourseCourseId(Long resourceId, Long courseId);

}
