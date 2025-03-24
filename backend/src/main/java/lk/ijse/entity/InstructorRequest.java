package lk.ijse.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "instructor_request")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class InstructorRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "qualifications", columnDefinition = "TEXT")
    private String qualifications;

    @ElementCollection
    @CollectionTable(name = "instructor_request_certificates", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "certificate_path", columnDefinition = "LONGBLOB")
    private List<String> certificates;

    @Column(name = "experience", columnDefinition = "TEXT")
    private String experience;

    @Column(name = "additional_details", columnDefinition = "TEXT")
    private String additionalDetails;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_status", nullable = false)
    private RequestStatus requestStatus = RequestStatus.PENDING;

    @Column(name = "request_created_at", nullable = false, updatable = false)
    private LocalDateTime requestCreatedAt = LocalDateTime.now();

    @Column(name = "request_updated_at")
    private LocalDateTime requestUpdatedAt;

    public enum RequestStatus {
        PENDING, APPROVED, REJECTED
    }

}
