package lk.ijse.repository;

import lk.ijse.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InstructorRepo extends JpaRepository<Instructor, Long> {

    Optional<Instructor> findByUserEmail(String email);

}
