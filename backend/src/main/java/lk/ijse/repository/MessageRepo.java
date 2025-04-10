package lk.ijse.repository;

import lk.ijse.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepo extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE m.sender.userId = :senderId AND m.receiver.userId = :receiverId")
    List<Message> findBySenderIdAndReceiverId(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);

    @Query("SELECT m FROM Message m WHERE m.course.courseId = :courseId")
    List<Message> findByCourseId(@Param("courseId") Long courseId);

}
