package lk.ijse.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lk.ijse.entity.Skill;
import lk.ijse.entity.User;
import lk.ijse.entity.UserSkill;
import lk.ijse.repository.SkillRepo;
import lk.ijse.repository.UserRepo;
import lk.ijse.repository.UserSkillRepo;
import lk.ijse.service.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SkillServiceImpl implements SkillService {

    @Autowired
    private SkillRepo skillRepo;

    @Autowired
    private UserSkillRepo userSkillRepo;

    @Autowired
    private UserRepo userRepo;

    @Override
    public Skill findOrCreateSkill(String skillName) {
        return skillRepo.findBySkillName(skillName)
                .orElseGet(() -> {
                    Skill newSkill = new Skill();
                    newSkill.setSkillName(skillName);
                    return skillRepo.save(newSkill);
                });
    }

    @Override
    public void addUserSkill(String email, String skillName) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Skill skill = findOrCreateSkill(skillName);

        if (userSkillRepo.findByUserAndSkill(user, skill).isEmpty()) {
            UserSkill userSkill = new UserSkill();
            userSkill.setUser(user);
            userSkill.setSkill(skill);
            userSkillRepo.save(userSkill);
        } else {
            throw new IllegalArgumentException("Skill \"" + skillName + "\" is already exists.");
        }
    }

    @Override
    public void removeUserSkill(String email, String skillName) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Skill skill = skillRepo.findBySkillName(skillName)
                .orElseThrow(() -> new EntityNotFoundException("Skill not found"));

        userSkillRepo.findByUserAndSkill(user, skill)
                .ifPresent(userSkillRepo::delete);
    }

    @Override
    public List<String> getUserSkills(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return userSkillRepo.findByUser(user)
                .stream()
                .map(userSkill -> userSkill.getSkill().getSkillName())
                .collect(Collectors.toList());
    }

}
