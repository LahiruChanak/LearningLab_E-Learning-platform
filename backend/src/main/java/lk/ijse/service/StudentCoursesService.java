package lk.ijse.service;

import lk.ijse.dto.StudentCoursesDTO;

public interface StudentCoursesService {

    StudentCoursesDTO getStudentCourses(String studentEmail);

}
