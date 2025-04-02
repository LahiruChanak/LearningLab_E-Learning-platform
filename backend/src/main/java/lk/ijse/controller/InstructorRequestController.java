package lk.ijse.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lk.ijse.dto.InstructorRequestDTO;
import lk.ijse.dto.ResponseDTO;
import lk.ijse.dto.UserDTO;
import lk.ijse.entity.InstructorRequest;
import lk.ijse.entity.User;
import lk.ijse.repository.InstructorRequestRepo;
import lk.ijse.repository.UserRepo;
import lk.ijse.service.UserService;
import lk.ijse.service.impl.InstructorRequestServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class InstructorRequestController {

    @Autowired
    private InstructorRequestServiceImpl instructorRequestService;

    @Autowired
    private InstructorRequestRepo instructorRequestRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private Cloudinary cloudinary;

    private static final String[] ALLOWED_FILE_TYPES = {"image/jpeg", "image/png", "image/gif", "application/pdf"};
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @GetMapping("/user/instructor/request")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResponseDTO> getUserInstructorRequest(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }

        String email = userDetails.getUsername();
        try {
            List<InstructorRequest> requests = instructorRequestRepo.findByUserEmail(email);
            if (requests.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseDTO(404, "No request found for your account", null));
            } else if (requests.size() > 1) {
                // Sort by requestUpdatedAt (or requestCreatedAt) and pick the most recent
                InstructorRequest latestRequest = requests.stream()
                        .sorted(Comparator.comparing(InstructorRequest::getRequestUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Unexpected error sorting requests"));
                InstructorRequestDTO requestDTO = modelMapper.map(latestRequest, InstructorRequestDTO.class);
                return ResponseEntity.ok(new ResponseDTO(200, "Your most recent request retrieved successfully", requestDTO));
            } else {
                InstructorRequestDTO requestDTO = modelMapper.map(requests.get(0), InstructorRequestDTO.class);
                return ResponseEntity.ok(new ResponseDTO(200, "Your request retrieved successfully", requestDTO));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error retrieving your request: " + e.getMessage(), null));
        }
    }

    @PostMapping(value = "/user/instructor/request", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResponseDTO> submitInstructorRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("message") String message,
            @RequestPart("qualifications") String qualifications,
            @RequestPart("experience") String experience,
            @RequestPart(value = "additionalDetails", required = false) String additionalDetails,
            @RequestPart(value = "existingCertificates", required = false) String existingCertificatesJson,
            @RequestPart(value = "certificates", required = false) MultipartFile[] certificates) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }

        String email = userDetails.getUsername();
        List<InstructorRequest> existingRequests = instructorRequestRepo.findByUserEmail(email);
        InstructorRequest request;

        try {
            if (!existingRequests.isEmpty()) {
                // Update existing request
                request = existingRequests.stream()
                        .sorted(Comparator.comparing(InstructorRequest::getRequestUpdatedAt,
                                Comparator.nullsLast(Comparator.reverseOrder())))
                        .findFirst()
                        .orElse(existingRequests.get(0));
                request.setMessage(message);
                request.setQualifications(qualifications);
                request.setExperience(experience);
                request.setAdditionalDetails(additionalDetails);
                request.setRequestUpdatedAt(LocalDateTime.now());

                List<String> currentCertificates = request.getCertificates() != null ?
                        new ArrayList<>(request.getCertificates()) : new ArrayList<>();

                // Handle existing certificates
                if (existingCertificatesJson != null && !existingCertificatesJson.isEmpty()) {
                    List<String> existingCertificates = new ObjectMapper().readValue(existingCertificatesJson, List.class);
                    currentCertificates.addAll(existingCertificates);
                }

                // Handle new certificates
                if (certificates != null && certificates.length > 0) {
                    for (MultipartFile certificate : certificates) {
                        if (!certificate.isEmpty()) {
                            if (certificate.getSize() > MAX_FILE_SIZE) {
                                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ResponseDTO(400, "Certificate file size must be less than 5MB", null));
                            }
                            if (!isValidFileType(certificate.getContentType())) {
                                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ResponseDTO(400, "Only JPG, PNG, GIF, and PDF are supported", null));
                            }

                            Map uploadResult = cloudinary.uploader().upload(certificate.getBytes(), ObjectUtils.asMap(
                                    "public_id", "instructor_certificates/" + email + "_" + System.currentTimeMillis() + "_" + certificate.getOriginalFilename(),
                                    "overwrite", true,
                                    "resource_type", "auto"
                            ));
                            currentCertificates.add((String) uploadResult.get("secure_url"));
                        }
                    }
                }
                request.setCertificates(currentCertificates);

                instructorRequestRepo.save(request);
                InstructorRequestDTO updatedRequestDTO = modelMapper.map(request, InstructorRequestDTO.class);
                return ResponseEntity.ok(new ResponseDTO(200, "Request updated successfully", updatedRequestDTO));
            } else {
                request = new InstructorRequest();
                User user = userRepo.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                request.setUser(user);
                request.setMessage(message);
                request.setQualifications(qualifications);
                request.setExperience(experience);
                request.setAdditionalDetails(additionalDetails);
                request.setRequestCreatedAt(LocalDateTime.now());
                request.setRequestUpdatedAt(LocalDateTime.now());
                request.setRequestStatus(InstructorRequest.RequestStatus.PENDING);

                List<String> certificateUrls = new ArrayList<>();
                if (certificates != null && certificates.length > 0) {
                    for (MultipartFile certificate : certificates) {
                        if (!certificate.isEmpty()) {
                            if (certificate.getSize() > MAX_FILE_SIZE) {
                                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ResponseDTO(400, "Certificate file size must be less than 5MB", null));
                            }
                            if (!isValidFileType(certificate.getContentType())) {
                                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ResponseDTO(400, "Only JPG, PNG, GIF, and PDF are supported", null));
                            }

                            Map uploadResult = cloudinary.uploader().upload(certificate.getBytes(), ObjectUtils.asMap(
                                    "public_id", "instructor_certificates/" + email + "_" + System.currentTimeMillis() + "_" + certificate.getOriginalFilename(),
                                    "overwrite", true,
                                    "resource_type", "auto"
                            ));
                            certificateUrls.add((String) uploadResult.get("secure_url"));
                        }
                    }
                }
                request.setCertificates(certificateUrls);

                instructorRequestRepo.save(request);
                InstructorRequestDTO newRequestDTO = modelMapper.map(request, InstructorRequestDTO.class);
                return ResponseEntity.ok(new ResponseDTO(200, "Request submitted successfully", newRequestDTO));
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error uploading certificates: " + e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Failed to process request: " + e.getMessage(), null));
        }
    }

    private boolean isValidFileType(String contentType) {
        return contentType != null && Arrays.asList(ALLOWED_FILE_TYPES).contains(contentType.toLowerCase());
    }

    @GetMapping("/admin/instructor/requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO> getAllRequests() {
        try {
            List<InstructorRequestDTO> requests = instructorRequestService.getAllRequests();
            return ResponseEntity.ok(new ResponseDTO(200, "Requests retrieved successfully", requests));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error retrieving requests: " + e.getMessage(), null));
        }
    }

    @PutMapping("/admin/instructor/requests/{requestId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO> updateRequestStatus(
            @PathVariable Long requestId,
            @RequestParam String status) {
        try {
            InstructorRequestDTO updatedRequest = instructorRequestService.updateRequestStatus(requestId, status);
            return ResponseEntity.ok(new ResponseDTO(200, "Request status updated successfully", updatedRequest));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error updating request status: " + e.getMessage(), null));
        }
    }
}
