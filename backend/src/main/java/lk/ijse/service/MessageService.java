package lk.ijse.service;

import lk.ijse.dto.MessageDTO;
import lk.ijse.dto.UserDTO;

import java.util.List;

public interface MessageService {

    List<MessageDTO> getMessagesBetweenUsers(Long senderId, Long receiverId);

    List<MessageDTO> getGroupMessages(Long courseId);

    MessageDTO sendMessage(MessageDTO messageDTO);

    List<UserDTO> getAvailableContacts();

}
