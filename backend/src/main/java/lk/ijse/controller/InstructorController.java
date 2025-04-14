package lk.ijse.controller;

import lk.ijse.dto.InstructorDetailsDTO;
import lk.ijse.service.InstructorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/instructor")
@RequiredArgsConstructor
public class InstructorController {

    private final InstructorService instructorService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllInstructors() {
        List<InstructorDetailsDTO> instructors = instructorService.getAllInstructors();
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("data", instructors);
        return ResponseEntity.ok(response);
    }
}
