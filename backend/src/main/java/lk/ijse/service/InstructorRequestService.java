package lk.ijse.service;

import lk.ijse.dto.InstructorRequestDTO;
import java.util.List;

public interface InstructorRequestService {

    List<InstructorRequestDTO> getAllRequests();

    InstructorRequestDTO updateRequestStatus(Long requestId, String status);

}
