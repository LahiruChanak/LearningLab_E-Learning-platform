package lk.ijse.controller;

import lk.ijse.dto.CourseResourceDTO;
import lk.ijse.dto.ResponseDTO;
import lk.ijse.service.CourseResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course/{courseId}/resources")
@PreAuthorize("hasRole('INSTRUCTOR')")
public class CourseResourceController {

    @Autowired
    private CourseResourceService resourceService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResponseDTO> addResource(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @RequestPart("resourceDTO") CourseResourceDTO resourceDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            CourseResourceDTO createdResource = resourceService.addResource(courseId, resourceDTO, file, userDetails.getUsername());
            return ResponseEntity.ok(new ResponseDTO(200, "Resource added successfully", createdResource));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @PutMapping(value = "/{resourceId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResponseDTO> updateResource(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @PathVariable Long resourceId,
            @RequestPart("resourceDTO") CourseResourceDTO resourceDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            CourseResourceDTO updatedResource = resourceService.updateResource(courseId, resourceId, resourceDTO, file, userDetails.getUsername());
            return ResponseEntity.ok(new ResponseDTO(200, "Resource updated successfully", updatedResource));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<ResponseDTO> deleteResource(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @PathVariable Long resourceId) {
        try {
            resourceService.deleteResource(courseId, resourceId, userDetails.getUsername());
            return ResponseEntity.ok(new ResponseDTO(200, "Resource deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN', 'STUDENT')")
    public ResponseEntity<ResponseDTO> getResources(@PathVariable Long courseId) {
        try {
            List<CourseResourceDTO> resources = resourceService.getResourcesByCourseId(courseId);
            return ResponseEntity.ok(new ResponseDTO(200, "Resources retrieved successfully", resources));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }
}
