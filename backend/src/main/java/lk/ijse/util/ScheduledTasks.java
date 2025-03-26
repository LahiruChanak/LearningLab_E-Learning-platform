package lk.ijse.util;

import jakarta.annotation.PostConstruct;
import lk.ijse.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ScheduledTasks {

    @Autowired
    private UserService userService;

    @Scheduled(cron = "0 0 0 * * ?")
    public void deleteInactiveAccounts() {
        userService.permanentlyDeleteInactiveAccounts();
    }

    @PostConstruct // Runs once on application startup
    public void runOnStartup() {
        deleteInactiveAccounts();
    }
}