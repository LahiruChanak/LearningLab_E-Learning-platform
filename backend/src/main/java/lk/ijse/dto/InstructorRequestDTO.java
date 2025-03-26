package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class InstructorRequestDTO {
    private String message;
    private String qualifications;
    private MultipartFile[] certificates; // For file uploads from frontend
    private List<String> certificateUrls; // Set by controller after upload
    private String experience;
    private String additionalDetails;
}
