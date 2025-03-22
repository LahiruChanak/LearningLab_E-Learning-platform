package lk.ijse.service;

import lk.ijse.dto.SkillDTO;
import lk.ijse.entity.Skill;

import java.util.List;

public interface SkillService {

    Skill findOrCreateSkill(String skillName);

    void addUserSkill(String email, String skillName);

    void removeUserSkill(String email, String skillName);

    List<String> getUserSkills(String email);

}
