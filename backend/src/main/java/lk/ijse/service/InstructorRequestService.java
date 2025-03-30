package lk.ijse.service;

import lk.ijse.dto.InstructorRequestDTO;
import lk.ijse.dto.UserDTO;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

public interface InstructorRequestService {

    UserDTO submitInstructorRequest(UserDetails userDetails, InstructorRequestDTO requestDTO);

    List<InstructorRequestDTO> getAllRequests();

    InstructorRequestDTO updateRequestStatus(Long requestId, String status);

}
