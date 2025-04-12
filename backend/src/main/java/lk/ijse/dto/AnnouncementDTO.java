package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AnnouncementDTO {
    private Long announcementId;
    private Long courseId;
    private String title;
    private LocalDateTime date;
    private String description;
}
