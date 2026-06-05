package com.nudge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NudgeApplication {
    public static void main(String[] args) {
        SpringApplication.run(NudgeApplication.class, args);
    }
}
