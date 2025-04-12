package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class InstructorDetailsDTO {
    private Long instructorId;
    private String fullName;
    private String bio;
    private String profilePicture;
    private String availability;
    private Integer yearsOfExperience;
    private String email;
}
