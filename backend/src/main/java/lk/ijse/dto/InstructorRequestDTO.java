package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class InstructorRequestDTO {
    private Long id;
    private String message;
    private String qualifications;
    private List<String> certificates;
    private String experience;
    private String additionalDetails;
    private String requestStatus;
    private String userEmail;
    private LocalDateTime requestCreatedAt;
    private LocalDateTime requestUpdatedAt;
}
