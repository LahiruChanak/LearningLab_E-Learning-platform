package lk.ijse.service;

import lk.ijse.dto.CourseResourceDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CourseResourceService {

    CourseResourceDTO addResource(Long courseId, CourseResourceDTO resourceDTO, MultipartFile file, String instructorEmail);

    CourseResourceDTO updateResource(Long courseId, Long resourceId, CourseResourceDTO resourceDTO, MultipartFile file, String instructorEmail);

    void deleteResource(Long courseId, Long resourceId, String instructorEmail);

    List<CourseResourceDTO> getResourcesByCourseId(Long courseId);

}
