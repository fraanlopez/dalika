package com.dalika.quotes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class DalikaQuotesApplication {

    public static void main(String[] args) {
        SpringApplication.run(DalikaQuotesApplication.class, args);
    }
}
