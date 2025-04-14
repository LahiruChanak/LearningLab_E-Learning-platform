package lk.ijse.service.impl;

import lk.ijse.dto.InstructorDetailsDTO;
import lk.ijse.repository.InstructorRepo;
import lk.ijse.service.InstructorService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InstructorServiceImpl implements InstructorService {

    @Autowired
    private InstructorRepo instructorRepo;

    @Override
    public List<InstructorDetailsDTO> getAllInstructors() {
        return instructorRepo.findAllInstructorDetails();
    }
}
