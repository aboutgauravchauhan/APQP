package com.apqp.main.common.scheduler;

import com.apqp.main.apqp.service.ApqpTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApqpScheduler {

    private final ApqpTaskService taskService;

    /**
     * Runs every day at 6 AM to mark overdue tasks and trigger escalations.
     */
    @Scheduled(cron = "0 0 6 * * *")
    public void checkOverdueTasks() {
        log.info("Scheduler: checking for overdue APQP tasks...");
        taskService.checkAndMarkOverdueTasks();
    }
}
