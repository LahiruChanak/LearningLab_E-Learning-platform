package lk.ijse.repository;

import lk.ijse.entity.Skill;
import lk.ijse.entity.User;
import lk.ijse.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSkillRepo extends JpaRepository<UserSkill, Long> {

    List<UserSkill> findByUser(User user);

    Optional<UserSkill> findByUserAndSkill(User user, Skill skill);

}
