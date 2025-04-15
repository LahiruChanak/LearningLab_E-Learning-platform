package lk.ijse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class InstructorStatsDTO {
    private long studentCount;
    private double totalEarnings;
    private double averageRating;
}
