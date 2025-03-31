package lk.ijse.service.impl;

import lk.ijse.dto.InstructorRequestDTO;
import lk.ijse.dto.UserDTO;
import lk.ijse.entity.Instructor;
import lk.ijse.entity.InstructorRequest;
import lk.ijse.entity.User;
import lk.ijse.repository.InstructorRepo;
import lk.ijse.repository.InstructorRequestRepo;
import lk.ijse.repository.UserRepo;
import lk.ijse.service.InstructorRequestService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InstructorRequestServiceImpl implements InstructorRequestService {

    @Autowired
    private InstructorRequestRepo instructorRequestRepo;

    @Autowired
    private InstructorRepo instructorRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ModelMapper modelMapper;


    @Override
    public UserDTO submitInstructorRequest(UserDetails userDetails, InstructorRequestDTO requestDTO) {
        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userDetails.getUsername()));

        InstructorRequest request = new InstructorRequest();
        request.setUser(user);
        request.setMessage(requestDTO.getMessage());
        request.setQualifications(requestDTO.getQualifications());
        request.setExperience(requestDTO.getExperience());
        request.setAdditionalDetails(requestDTO.getAdditionalDetails());
        request.setRequestStatus(InstructorRequest.RequestStatus.PENDING);
        request.setRequestCreatedAt(LocalDateTime.now());
        request.setRequestUpdatedAt(LocalDateTime.now());
        request.setCertificates(requestDTO.getCertificates() != null ? requestDTO.getCertificates() : Collections.emptyList());

        instructorRequestRepo.save(request);

        return modelMapper.map(user, UserDTO.class);
    }

    public List<InstructorRequestDTO> getAllRequests() {
        return instructorRequestRepo.findAll().stream()
                .map(request -> {
                    InstructorRequestDTO dto = modelMapper.map(request, InstructorRequestDTO.class);
                    dto.setUserEmail(request.getUser().getEmail());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public InstructorRequestDTO updateRequestStatus(Long requestId, String status) {
        InstructorRequest request = instructorRequestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + requestId));

        InstructorRequest.RequestStatus newStatus;
        try {
            newStatus = InstructorRequest.RequestStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value. Must be PENDING, APPROVED, or REJECTED");
        }

        request.setRequestStatus(newStatus);
        request.setRequestUpdatedAt(LocalDateTime.now());

        if (newStatus == InstructorRequest.RequestStatus.APPROVED) {
            User user = request.getUser();
            if (user == null) {
                user = userRepo.findByEmail(request.getUser().getEmail())
                        .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getUser().getEmail()));
            }
            if ("STUDENT".equalsIgnoreCase((user.getRole()).toString())) {
                user.setRole(User.Role.INSTRUCTOR);
                userRepo.save(user);
            }

            // Check if Instructor entity already exists
            Instructor instructor = instructorRepo.findByUserEmail(user.getEmail()).orElse(null);
            if (instructor == null) {
                instructor = new Instructor();
                instructor.setUser(user);
                instructor.setAvailability(getDefaultAvailability(request));
                instructor.setYearsOfExperience(request.getExperience() != null ? parseExperience(request.getExperience()) : 0);
                instructor.setCoursesTaught(new java.util.ArrayList<>());
                instructorRepo.save(instructor);
            }
        }

        instructorRequestRepo.save(request);

        InstructorRequestDTO dto = modelMapper.map(request, InstructorRequestDTO.class);
        dto.setUserEmail(request.getUser().getEmail());
        return dto;
    }

    private String getDefaultAvailability(InstructorRequest request) {
        LocalDateTime approvalTime = request.getRequestUpdatedAt() != null
                ? request.getRequestUpdatedAt()
                : LocalDateTime.now();

        // Format into custom format
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy MMMM dd - hh:mm a");
        return approvalTime.format(formatter);
    }

    private Integer parseExperience(String experience) {
        try {
            return Integer.parseInt(experience.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
