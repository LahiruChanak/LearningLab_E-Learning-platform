package lk.ijse.controller;

import lk.ijse.dto.ResponseDTO;
import lk.ijse.dto.SkillDTO;
import lk.ijse.service.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/user/skills")
@CrossOrigin(origins = "*")
public class SkillController {

    @Autowired
    private SkillService skillService;

    @GetMapping
    public ResponseEntity<ResponseDTO> getUserSkills(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }

        try {
            String email = authentication.getName();
            List<String> skills = skillService.getUserSkills(email);
            return ResponseEntity.ok(new ResponseDTO(200, "Skills retrieved", skills));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, "Error retrieving skills: " + e.getMessage(), null));
        }
    }

    @PostMapping
    public ResponseEntity<ResponseDTO> addUserSkill(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }

        try {
            String skillName = request.get("skillName");
            if (skillName == null || skillName.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseDTO(400, "Skill name is required", null));
            }

            String email = authentication.getName();
            skillService.addUserSkill(email, skillName.trim());
            return ResponseEntity.ok(new ResponseDTO(200, "Skill added", null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ResponseDTO(409, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, e.getMessage(), null));
        }
    }

    @DeleteMapping
    public ResponseEntity<ResponseDTO> removeUserSkill(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO(401, "Unauthorized", null));
        }

        try {
            String skillName = request.get("skillName");
            if (skillName == null || skillName.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseDTO(400, "Skill name is required", null));
            }

            String email = authentication.getName();
            skillService.removeUserSkill(email, skillName.trim());
            return ResponseEntity.ok(new ResponseDTO(200, "Skill removed", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(500, e.getMessage(), null));
        }
    }

}
