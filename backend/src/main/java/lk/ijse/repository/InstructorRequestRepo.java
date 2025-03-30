package lk.ijse.repository;

import lk.ijse.entity.InstructorRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InstructorRequestRepo extends JpaRepository<InstructorRequest, Long> {

    List<InstructorRequest> findByUserEmail(String email);

}
