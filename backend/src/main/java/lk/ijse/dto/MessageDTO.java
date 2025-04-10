package lk.ijse.dto;

import lk.ijse.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MessageDTO {
    private Long messageId;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String receiverName;
    private Long courseId;
    private String content;
    private LocalDateTime sentAt;
    private Boolean isRead;
    private Message.ChatType chatType;
}
