package lk.ijse.controller;

import lk.ijse.dto.FAQDTO;
import lk.ijse.dto.ResponseDTO;
import lk.ijse.service.FAQService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course/{courseId}/faqs")
public class FAQController {

    @Autowired
    private FAQService faqService;

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ResponseDTO> addFAQ(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @RequestBody FAQDTO faqDTO) {
        try {
            FAQDTO createdFAQ = faqService.addFAQ(courseId, faqDTO, userDetails.getUsername());
            return ResponseEntity.ok(new ResponseDTO(200, "FAQ added successfully", createdFAQ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @PutMapping("/{faqId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ResponseDTO> updateFAQ(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @PathVariable Long faqId,
            @RequestBody FAQDTO faqDTO) {
        try {
            FAQDTO updatedFAQ = faqService.updateFAQ(courseId, faqId, faqDTO, userDetails.getUsername());
            return ResponseEntity.ok(new ResponseDTO(200, "FAQ updated successfully", updatedFAQ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{faqId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ResponseDTO> deleteFAQ(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @PathVariable Long faqId) {
        try {
            faqService.deleteFAQ(courseId, faqId, userDetails.getUsername());
            return ResponseEntity.ok(new ResponseDTO(200, "FAQ deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ResponseDTO> getFAQs(@PathVariable Long courseId) {
        try {
            List<FAQDTO> faqs = faqService.getFAQsByCourseId(courseId);
            return ResponseEntity.ok(new ResponseDTO(200, "FAQs retrieved successfully", faqs));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @PostMapping("/questions")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseDTO> submitQuestion(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @RequestBody FAQDTO faqDTO) {
        try {
            FAQDTO submittedQuestion = faqService.submitQuestion(courseId, faqDTO, userDetails.getUsername());
            return ResponseEntity.ok(new ResponseDTO(200, "Question submitted successfully", submittedQuestion));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }
}
