package lk.ijse.repository;

import lk.ijse.dto.InstructorDetailsDTO;
import lk.ijse.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface InstructorRepo extends JpaRepository<Instructor, Long> {

    Optional<Instructor> findByUserEmail(String email);

    @Query("SELECT new lk.ijse.dto.InstructorDetailsDTO(" +
            "i.instructorId, u.fullName, u.bio, u.profilePicture, i.availability, i.yearsOfExperience, u.email) " +
            "FROM Instructor i JOIN i.user u")
    List<InstructorDetailsDTO> findAllInstructorDetails();

}
