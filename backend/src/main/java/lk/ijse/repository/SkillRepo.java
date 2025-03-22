package lk.ijse.repository;

import lk.ijse.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillRepo extends JpaRepository<Skill, Long> {

    Optional<Skill> findBySkillName(String skillName);

    List<Skill> findBySkillNameContainingIgnoreCase(String query);

}
