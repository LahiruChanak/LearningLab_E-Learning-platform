package lk.ijse.controller;

import lk.ijse.dto.MessageDTO;
import lk.ijse.dto.UserDTO;
import lk.ijse.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
public class MessageController {

    private final MessageService chatService;

    @Autowired
    public MessageController(MessageService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/messages/private")
    public ResponseEntity<List<MessageDTO>> getPrivateMessages(
            @RequestParam Long senderId,
            @RequestParam Long receiverId) {
        return ResponseEntity.ok(chatService.getMessagesBetweenUsers(senderId, receiverId));
    }

    @GetMapping("/messages/group")
    public ResponseEntity<List<MessageDTO>> getGroupMessages(
            @RequestParam Long courseId) {
        return ResponseEntity.ok(chatService.getGroupMessages(courseId));
    }

    @PostMapping("/send")
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody MessageDTO messageDTO) {
        return ResponseEntity.ok(chatService.sendMessage(messageDTO));
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<UserDTO>> getContacts() {
        return ResponseEntity.ok(chatService.getAvailableContacts());
    }
}
