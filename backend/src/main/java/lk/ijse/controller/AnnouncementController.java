package lk.ijse.controller;

import lk.ijse.dto.AnnouncementDTO;
import lk.ijse.dto.ResponseDTO;
import lk.ijse.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course/{courseId}/announcements")
@PreAuthorize("hasRole('INSTRUCTOR')")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @PostMapping
    public ResponseEntity<ResponseDTO> addAnnouncement(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @RequestBody AnnouncementDTO announcementDTO) {
        try {
            AnnouncementDTO createdAnnouncement = announcementService.addAnnouncement(
                    courseId, announcementDTO, userDetails.getUsername());
            return ResponseEntity.ok(new ResponseDTO(200, "Announcement added successfully", createdAnnouncement));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @PutMapping("/{announcementId}")
    public ResponseEntity<ResponseDTO> updateAnnouncement(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @PathVariable Long announcementId,
            @RequestBody AnnouncementDTO announcementDTO) {
        try {
            AnnouncementDTO updatedAnnouncement = announcementService.updateAnnouncement(
                    courseId, announcementId, announcementDTO, userDetails.getUsername());
            return ResponseEntity.ok(new ResponseDTO(200, "Announcement updated successfully", updatedAnnouncement));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{announcementId}")
    public ResponseEntity<ResponseDTO> deleteAnnouncement(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @PathVariable Long announcementId) {
        try {
            announcementService.deleteAnnouncement(courseId, announcementId, userDetails.getUsername());
            return ResponseEntity.ok(new ResponseDTO(200, "Announcement deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN', 'STUDENT')")
    public ResponseEntity<ResponseDTO> getAnnouncements(@PathVariable Long courseId) {
        try {
            List<AnnouncementDTO> announcements = announcementService.getAnnouncementsByCourseId(courseId);
            return ResponseEntity.ok(new ResponseDTO(200, "Announcements retrieved successfully", announcements));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }
}
