package lk.ijse.controller;

import lk.ijse.dto.InstructorRequestDTO;
import lk.ijse.dto.ResponseDTO;
import lk.ijse.service.impl.InstructorRequestServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/instructor/requests")
public class InstructorRequestController {

    @Autowired
    private InstructorRequestServiceImpl requestService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO> getAllRequests() {
        try {
            List<InstructorRequestDTO> requests = requestService.getAllRequests();
            return ResponseEntity.ok(new ResponseDTO(200, "Requests retrieved successfully", requests));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error retrieving requests: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{requestId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO> updateRequestStatus(
            @PathVariable Long requestId,
            @RequestParam String status) {
        try {
            InstructorRequestDTO updatedRequest = requestService.updateRequestStatus(requestId, status);
            return ResponseEntity.ok(new ResponseDTO(200, "Request status updated successfully", updatedRequest));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error updating request status: " + e.getMessage(), null));
        }
    }
}
