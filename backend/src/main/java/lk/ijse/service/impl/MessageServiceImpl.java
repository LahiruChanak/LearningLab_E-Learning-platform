package lk.ijse.service.impl;

import lk.ijse.dto.MessageDTO;
import lk.ijse.dto.UserDTO;
import lk.ijse.entity.Course;
import lk.ijse.entity.Message;
import lk.ijse.entity.User;
import lk.ijse.repository.CourseRepo;
import lk.ijse.repository.MessageRepo;
import lk.ijse.repository.UserRepo;
import lk.ijse.service.MessageService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private final MessageRepo messageRepo;

    @Autowired
    private final UserRepo userRepo;

    @Autowired
    private final CourseRepo courseRepo;

    @Autowired
    private final ModelMapper modelMapper;

    @Autowired
    public MessageServiceImpl(MessageRepo messageRepo, UserRepo userRepo,
                              CourseRepo courseRepo, ModelMapper modelMapper) {
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.courseRepo = courseRepo;
        this.modelMapper = modelMapper;
    }

    @Override
    public List<MessageDTO> getMessagesBetweenUsers(Long senderId, Long receiverId) {
        List<Message> messages = messageRepo.findBySenderIdAndReceiverId(senderId, receiverId);
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageDTO> getGroupMessages(Long courseId) {
        List<Message> messages = messageRepo.findByCourseId(courseId);
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageDTO sendMessage(MessageDTO messageDTO) {
        Message message = new Message();
        User sender = userRepo.findById(messageDTO.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepo.findById(messageDTO.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(messageDTO.getContent());
        message.setChatType(messageDTO.getChatType());
        message.setSentAt(LocalDateTime.now());
        message.setIsRead(false);

        if (messageDTO.getCourseId() != null) {
            Course course = courseRepo.findById(messageDTO.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            message.setCourse(course);
        }

        Message savedMessage = messageRepo.save(message);
        return convertToDTO(savedMessage);
    }

    @Override
    public List<UserDTO> getAvailableContacts() {
        List<User> users = userRepo.findAll();
        return users.stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .collect(Collectors.toList());
    }

    private MessageDTO convertToDTO(Message message) {
        MessageDTO dto = modelMapper.map(message, MessageDTO.class);
        dto.setSenderName(message.getSender().getFullName());
        dto.setReceiverName(message.getReceiver().getFullName());
        return dto;
    }
}
