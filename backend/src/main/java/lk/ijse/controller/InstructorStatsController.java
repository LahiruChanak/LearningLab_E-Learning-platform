package lk.ijse.controller;

import lk.ijse.dto.InstructorStatsDTO;
import lk.ijse.service.InstructorStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/instructor/stats")
@RequiredArgsConstructor
public class InstructorStatsController {

    private final InstructorStatsService instructorStatsService;

    @GetMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<InstructorStatsDTO> getInstructorStats(Authentication authentication) {
        String instructorEmail = authentication.getName();
        InstructorStatsDTO stats = instructorStatsService.getInstructorStats(instructorEmail);
        return ResponseEntity.ok(stats);
    }
}
