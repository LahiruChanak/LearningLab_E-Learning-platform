package lk.ijse.service.impl;

import lk.ijse.dto.InstructorRequestDTO;
import lk.ijse.entity.InstructorRequest;
import lk.ijse.service.AdminService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

//    @Autowired
//    private ModelMapper modelMapper;
//
//    public List<InstructorRequestDTO> getPendingInstructorRequests() {
//        List<InstructorRequest> requests = instructorRequestRepo.findByRequestStatus(InstructorRequest.RequestStatus.PENDING);
//        return requests.stream()
//                .map(request -> {
//                    InstructorRequestDTO dto = modelMapper.map(request, InstructorRequestDTO.class);
//                    dto.setRequestStatus(request.getRequestStatus().name());
//                    dto.setUserFullName(request.getUser().getFullName()); // Assuming User has fullName
//                    dto.setUserEmail(request.getUser().getEmail());       // Assuming User has email
//                    return dto;
//                })
//                .collect(Collectors.toList());
//    }
//
//    public InstructorRequestDTO updateInstructorRequestStatus(Long requestId, String status) {
//        InstructorRequest request = instructorRequestRepo.findById(requestId)
//                .orElseThrow(() -> new RuntimeException("Instructor request not found with ID: " + requestId));
//
//        if ("APPROVED".equalsIgnoreCase(status)) {
//            request.setRequestStatus(InstructorRequest.RequestStatus.APPROVED);
//        } else if ("REJECTED".equalsIgnoreCase(status)) {
//            request.setRequestStatus(InstructorRequest.RequestStatus.REJECTED);
//        } else {
//            throw new IllegalArgumentException("Invalid status: " + status);
//        }
//        request.setRequestUpdatedAt(LocalDateTime.now());
//        instructorRequestRepo.save(request);
//
//        InstructorRequestDTO dto = modelMapper.map(request, InstructorRequestDTO.class);
//        dto.setRequestStatus(request.getRequestStatus().name());
//        dto.setUserFullName(request.getUser().getFullName());
//        dto.setUserEmail(request.getUser().getEmail());
//        return dto;
//    }
}
