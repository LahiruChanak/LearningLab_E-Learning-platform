package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ContactDTO {
    private Long id;
    private String name;
    private String avatar;
    private String lastMessage;
    private String time;
    private boolean isGroup;
}
