package lk.ijse.service.impl;

import lk.ijse.dto.InstructorRequestDTO;
import lk.ijse.entity.InstructorRequest;
import lk.ijse.repository.InstructorRequestRepo;
import lk.ijse.service.InstructorRequestService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InstructorRequestServiceImpl implements InstructorRequestService {

    @Autowired
    private InstructorRequestRepo requestRepo;

    @Autowired
    private ModelMapper modelMapper;

    public List<InstructorRequestDTO> getAllRequests() {
        return requestRepo.findAll().stream()
                .map(request -> {
                    InstructorRequestDTO dto = modelMapper.map(request, InstructorRequestDTO.class);
                    dto.setUserEmail(request.getUser().getEmail());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public InstructorRequestDTO updateRequestStatus(Long requestId, String status) {
        InstructorRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + requestId));

        InstructorRequest.RequestStatus newStatus;
        try {
            newStatus = InstructorRequest.RequestStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value. Must be PENDING, APPROVED, or REJECTED");
        }

        request.setRequestStatus(newStatus);
        request.setRequestUpdatedAt(LocalDateTime.now());
        requestRepo.save(request);

        InstructorRequestDTO dto = modelMapper.map(request, InstructorRequestDTO.class);
        dto.setUserEmail(request.getUser().getEmail());
        return dto;
    }
}
