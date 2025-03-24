package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class InstructorRequestDTO {
    private String message;
    private String qualifications;
    private List<String> certificates;
    private String experience;
    private String additionalDetails;
}
