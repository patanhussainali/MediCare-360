package com.medicare360;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class MediCare360Application {

    public static void main(String[] args) {
        SpringApplication.run(MediCare360Application.class, args);
    }
}
